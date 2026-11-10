/* 代祷 API — POST 公开提交 / GET 管理 */
function auth(r,e){const t=r.headers.get('Authorization')||'';return(t.startsWith('***')?t.slice(3):t).trim()===e.ADMIN_TOKEN}

export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'};
  const m=request.method;

  if(m==='POST'){
    const d=await request.json();
    await env.DB.prepare('INSERT INTO prayers (name,email,content) VALUES (?1,?2,?3)').bind(d.name||'',d.email||'',d.content||'').run();
    return new Response(JSON.stringify({ok:true}),{headers:h});
  }
  if(!auth(request,env))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:h});

  if(m==='GET'){
    const rows=await env.DB.prepare('SELECT * FROM prayers ORDER BY created_at DESC').all();
    return new Response(JSON.stringify({ok:true,data:rows.results}),{headers:h});
  }
  return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:h});
}
