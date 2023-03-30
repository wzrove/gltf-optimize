import './index.css';
import hls from 'hls.js';

export const fetchOption = (
  data: {
    mode: 'set' | 'get' | 'delete' | 'query';
    optionsKey?: string;
    optionsValue?: any;
  },
  url = '/handOption',
) => {
  return fetch(url, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const domSideMenu = document.querySelector('.menu');

const videCon = document.querySelector('#video-container');

const curhls = new hls();

type videoListInterface = Array<{
  oriName: string;
  curName: string;
  path: string;
  videoName: string;
  videoDec: string;
}>;

const renderList = async () => {
  if (domSideMenu) {
    const url = import.meta.env.MODE == 'development' ? '/handVideoOption' : './videoList.json';
    let res: Response;
    if (import.meta.env.MODE == 'development') {
      res = await fetchOption({ mode: 'get' }, url);
    } else {
      res = await fetch(url);
    }
    let data: videoListInterface = await res.json();
    //@ts-ignore
    if (!Array.isArray(data)) data = data?.data;
    const baseTemplateItem = (text: string, isActive: boolean, index: number) =>
      `<li><a ${isActive ? 'class= "active"' : ''} sortIndex=${index}>${text}</a></li>`;
    const domListString = data.reduce((acc, cur, index) => {
      return (acc += baseTemplateItem(cur.videoName, index == 0 ? true : false, index));
    }, '');
    domSideMenu.innerHTML = domListString;
    const childList = Array.from(domSideMenu.childNodes);
    let preActiveDom = (childList[0] as Element).firstChild as Element;
    changeVideoEle(data[0]);
    domSideMenu.addEventListener('click', (e) => {
      if (e.target) {
        const _curActiveDom = e.target as Element;
        if (!_curActiveDom.hasAttribute('sortIndex')) {
          return;
        }
        preActiveDom?.classList.remove('active');
        preActiveDom = _curActiveDom;
        _curActiveDom.classList.add('active');
        changeVideoEle(data[Number(_curActiveDom.getAttribute('sortIndex') as any)]);
      }
    });
  }
};

const changeVideoEle = (data: { path: string; videoName: string; videoDec: string }) => {
  console.log(videCon, '---');
  const nameEle = videCon?.querySelector('.videoName');
  const decEle = videCon?.querySelector('.videoDec');
  const videoEle = videCon?.querySelector('video');
  console.log(nameEle, decEle);
  if (nameEle) {
    nameEle.innerHTML = data.videoName;
  }
  if (decEle) {
    decEle.innerHTML = data.videoDec;
  }

  if (videoEle) {
    curhls.loadSource(window.location.origin + data.path);
    curhls.attachMedia(videoEle);
    videoEle.play();
  }
};

renderList();
