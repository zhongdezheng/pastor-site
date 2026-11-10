/* Login API — POST /api/login */
export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*"};
  
  if(request.method==="POST"){
    const d=await request.json();
    if(d.user==="admin"&&d.pass===env.ADMIN_TOKEN)
      return new Response(JSON.stringify({ok:true,token:env.ADMIN_TOKEN,user:"admin"}),{headers:h});
    return new Response(JSON.stringify({ok:false,error:"Invalid credentials"}),{status:401,headers:h});
  }
  // Auth check via GET
  if(request.method==="GET"){
    const a=request.headers.get("Authorization")||"";
    const t=(a.startsWith("Bearer ")?a.slice(7):a).trim();
    if(t===env.ADMIN_TOKEN)return new Response(JSON.stringify({ok:true}),{headers:h});
    return new Response(JSON.stringify({ok:false}),{status:401,headers:h});
  }
  return new Response(JSON.stringify({error:"Method not allowed",method:request.method}),{status:405,headers:h});
}
