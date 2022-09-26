// src/routes/cors_endpoint/[arguments].json.js


export async function get({ params }) {

    const { tile } = params;
    const externalhost = `https://wolfiex.github.io/ONS_Maptiles/LSOA/`
    console.error('eh',externalhost, tile)

    const res = await fetch(`${externalhost}${tile}`);
    const data = await res;
    console.error('rt', data.statusText,data)


    return JSON.parse(data.body);    
}




// /[org]/[repo]/tree/[branch]/[...file]
// ...in which case a request for /sveltejs/kit/tree/master/documentation/docs/01-routing.md would result in the following parameters being available to the page:

// {
//   org: 'sveltejs',
//   repo: 'kit',
//   branch: 'master',
//   file: 'documentation/docs/01-routing.md'
// }