import fs from 'fs';

const getFromInstagram = async (username = '', next = "") => {
    let url = `https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=${username}&url_embed_safe=true`;
    if(next != ""){
      url += `&pagination_token=${next}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '83cc4df0c3msh060b47dd9ccbf22p17a649jsn3936677b3c97',
		    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    });
    const data = await response.json();
    return data;
}
const getPosts = async () => {
  let posts = {
    more_available: false,
    next: '',
    items: [],
    user: {}
  }
  do{
    console.log('GETTING POSTS ID:', posts.next)
    const response = await getFromInstagram('bricktober2024', posts.next);
    // console.log('RESPONSE', response)
    if(response.detail){
      console.error('ERROR', response.detail)
      break;
    }
    posts.user = response.data.user
    // console.log('ITEMS', response.data)
    posts.items = [
      ...posts.items,
      ...response.data.items
    ];
    posts.more_available = response.pagination_token != null ? true : false;
    // posts.more_available = false;
    posts.next = response.pagination_token;
    const postsMapped = mapPosts(posts);
    saveInFile(postsMapped);
  } while(posts.more_available);
  
  
  return posts;
}

const mapPosts = (posts) => {
  const bricktober = posts.user
  const mappedPosts = posts.items.map((post) => {
    return {
      id: post.caption?.id,
      code: post.code,
      user: post.caption?.user,
      text: post.caption?.text,
      likers: post.likers,
      likes: post.like_count,
      thumbnail: post.thumbnail_url,
      created_at: post.caption?.created_at_utc,
    }
  });
  return {
    owner: bricktober,
    posts: mappedPosts
  };
};

const saveInFile = (posts) => {
  fs.writeFileSync('data.json', JSON.stringify(posts));
}

getPosts()
