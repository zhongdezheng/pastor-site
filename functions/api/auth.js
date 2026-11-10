/*
 * Auth Check API — GET /api/auth/check
 * 验证 token 是否有效
 */
export async function onRequest(ctx){
  const {request,env}=ctx;
  const h={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*"};
  if(request.method==="GET"){
    const a=request.headers.get("Authorization")||"";
    const t=(a.startsWith("***")?a.slice(3):a).trim();
    if(t===env.ADMIN_TOKEN)return new Response(JSON.stringify({ok:true}),{headers:h});
    return new Response(JSON.stringify({ok:false}),{status:401,headers:h});
  }
  return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:h});
}
