async function run() {
  const repo = 'iKislay/Ligature';
  const repoRes = await fetch(`https://api.github.com/repos/${repo}`);
  if (!repoRes.ok) { console.log('not ok repo'); return; }
  const repoData = await repoRes.json();
  const totalStars = repoData.stargazers_count;
  const createdAt = repoData.created_at;

  const starData = [];
  starData.push({ date: new Date(createdAt), count: 0 });

  if (totalStars > 0) {
    const MAX_PAGES = 10;
    const totalPages = Math.ceil(totalStars / 100);
    const pagesToFetch = [];
    
    if (totalPages <= MAX_PAGES) {
      for (let i = 1; i <= totalPages; i++) pagesToFetch.push(i);
    } else {
      pagesToFetch.push(1);
      for (let i = 1; i < MAX_PAGES - 1; i++) {
        pagesToFetch.push(Math.floor((totalPages / (MAX_PAGES - 1)) * i));
      }
      pagesToFetch.push(totalPages);
    }

    const fetchPage = async (page) => {
      const res = await fetch(`https://api.github.com/repos/${repo}/stargazers?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github.v3.star+json' }
      });
      if (!res.ok) return [];
      return await res.json();
    };

    const pagesData = await Promise.all(pagesToFetch.map(p => fetchPage(p)));
    
    for (let i = 0; i < pagesToFetch.length; i++) {
      const pageData = pagesData[i];
      if (pageData.length > 0) {
        if (totalPages === 1) {
          pageData.forEach((item, idx) => {
            if (idx % 10 === 0 || idx === pageData.length - 1) {
              starData.push({ date: new Date(item.starred_at), count: idx + 1 });
            }
          });
        } else {
          const lastItem = pageData[pageData.length - 1];
          const count = (pagesToFetch[i] - 1) * 100 + pageData.length;
          starData.push({ date: new Date(lastItem.starred_at), count });
        }
      }
    }
    
    const lastCount = starData[starData.length - 1].count;
    if (lastCount < totalStars) {
       starData.push({ date: new Date(), count: totalStars });
    }
  }

  console.log(starData);
}
run();
