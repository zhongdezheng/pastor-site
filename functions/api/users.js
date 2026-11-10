/* 用户管理 API */
function auth(r,e){const t=r.headers.get('Authorization')||'';return(t.startsWith('***')?t.slice(3):t).trim()===e.ADMIN_TOKEN}

export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'};
  if(!auth(request,env))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:h});

  if(request.method==='GET'){
    const rows=await env.DB.prepare('SELECT id,username,display_name,role,active,created_at FROM users WHERE active=1').all();
    return new Response(JSON.stringify({ok:true,data:rows.results}),{headers:h});
  }
  return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:h});
}
