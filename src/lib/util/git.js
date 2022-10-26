export async function getgit (owner, repo, path) { 
    // A function to fetch files from github using the api 
    // coors bug fix 
    
  let data = await fetch (
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  )
    .then (d => d.json ())
    .then (d =>
      fetch (
        `https://api.github.com/repos/ONSvisual/cp-places-data/git/blobs/${d.sha}`
      )
    )
    .then (d => d.json ())
    .then (d => JSON.parse (atob (d.content)));

  return data;
}
