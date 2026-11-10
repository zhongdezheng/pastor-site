/* 异象 API */
function auth(r,e){const t=r.headers.get('Authorization')||'';return(t.startsWith('***')?t.slice(3):t).trim()===e.ADMIN_TOKEN}

export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'};
  const m=request.method;

  if(m==='GET'){
    const r=await env.DB.prepare('SELECT * FROM vision WHERE id=1').first();
    return new Response(JSON.stringify({ok:true,data:r||{}}),{headers:h});
  }
  if(!auth(request,env))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:h});

  if(m==='PUT'||m==='POST'){
    const d=await request.json();
    await env.DB.prepare('UPDATE vision SET title_zh=?1,title_en=?2,content_zh=?3,content_en=?4 WHERE id=1').bind(d.title_zh||'',d.title_en||'',d.content_zh||'',d.content_en||'').run();
    return new Response(JSON.stringify({ok:true}),{headers:h});
  }
  return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:h});
}
