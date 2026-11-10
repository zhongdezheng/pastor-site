/* 课程 API */
function auth(r,e){const t=r.headers.get('Authorization')||'';return(t.startsWith('***')?t.slice(3):t).trim()===e.ADMIN_TOKEN}

export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'};
  const m=request.method;
  const id=(new URL(request.url)).pathname.match(/\/api\/courses\/(\d+)/)?.[1];

  if(m==='GET'){
    if(id){const r=await env.DB.prepare('SELECT * FROM courses WHERE id=?').bind(id).first();return new Response(JSON.stringify({ok:true,data:r||null}),{headers:h});}
    const rows=await env.DB.prepare('SELECT * FROM courses WHERE status=1 ORDER BY sort_order,id').all();
    return new Response(JSON.stringify({ok:true,data:rows.results}),{headers:h});
  }
  if(!auth(request,env))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:h});

  if(m==='POST'){
    const d=await request.json();
    const r=await env.DB.prepare('INSERT INTO courses (title_zh,title_en,description_zh,description_en,icon,level,lessons,is_free,sort_order) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)').bind(d.title_zh||'',d.title_en||'',d.description_zh||'',d.description_en||'',d.icon||'📖',d.level||'入门',d.lessons||6,d.is_free||1,d.sort_order||0).run();
    return new Response(JSON.stringify({ok:true,id:r.meta.last_row_id}),{headers:h});
  }
  if(m==='PUT'&&id){
    const d=await request.json();
    const fs=['title_zh','title_en','description_zh','description_en','icon','level','lessons','is_free','sort_order','status'];
    const sets=fs.filter(f=>d[f]!==undefined).map(f=>f+'=?').join(',');
    const vs=fs.filter(f=>d[f]!==undefined).map(f=>d[f]);
    await env.DB.prepare(`UPDATE courses SET ${sets} WHERE id=?`).bind(...vs,id).run();
    return new Response(JSON.stringify({ok:true}),{headers:h});
  }
  if(m==='DELETE'&&id){
    await env.DB.prepare('UPDATE courses SET status=0 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ok:true}),{headers:h});
  }
  return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:h});
}
