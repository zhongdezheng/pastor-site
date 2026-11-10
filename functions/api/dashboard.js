/* Dashboard API - compatible with old admin format */
function auth(r,e){var t=r.headers.get("Authorization")||"";var v=(t.startsWith("***")?t.slice(3):t).trim();return v===e.ADMIN_TOKEN}

export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*"};
  if(!auth(request,env))return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:h});

  var today=new Date().toISOString().slice(0,10);
  var month=today.slice(0,7)+"-01";
  var p1=env.DB.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= ?").bind(today);
  var p2=env.DB.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= ?").bind(month);
  var p3=env.DB.prepare("SELECT COUNT(*) as c FROM products WHERE deleted=0");
  var p4=env.DB.prepare("SELECT COUNT(*) as c FROM categories WHERE status=1");
  var p5=env.DB.prepare("SELECT COUNT(*) as c FROM prayers");
  var p6=env.DB.prepare("SELECT COUNT(*) as c FROM testimonies WHERE published=1");
  var p7=env.DB.prepare("SELECT COUNT(*) as c FROM courses WHERE status=1");
  var p8=env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
  var results=await env.DB.batch([p1,p2,p3,p4,p5,p6,p7,p8]);
  
  var otc=results[0].results[0].c;
  var omc=results[1].results[0].c;
  var pac=results[2].results[0].c;
  var cac=results[3].results[0].c;
  var prc=results[4].results[0].c;
  var tsc=results[5].results[0].c;
  var coc=results[6].results[0].c;
  var ros=results[7].results;

  return new Response(JSON.stringify({ok:true,data:{
    orders:{today_count:otc,today_amount:0,month_count:omc,month_amount:0},
    products:{total:pac,active:pac,categories:cac},
    prayers:{total:prc,unreplied:prc},
    content:{testimonies:tsc,courses:coc},
    recent_orders:ros||[]
  }}),{headers:h});
}
