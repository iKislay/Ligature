const fetch = require('node-fetch');

async function getStarHistory(repo) {
  // Try fetching the first page and the last page to see how many pages there are
  const res = await fetch(`https://api.github.com/repos/${repo}`);
  const data = await res.json();
  console.log('Total stars:', data.stargazers_count);
  return data.stargazers_count;
}

getStarHistory('iKislay/Ligature');
