import './index.css';

const domSideMenu = document.querySelector('.menu');

const videCon = document.querySelector('#video-container');

console.log(domSideMenu, videCon);

type videoListInterface = Array<{
  oriName: string;
  curName: string;
  path: string;
  videoName: string;
  videoDec: string;
}>;

const renderList = async () => {
  if (domSideMenu) {
    const res = await fetch('./videoList.json');
    const data: videoListInterface = await res.json();
    const baseTemplateItem = (text: string, isActive: boolean) =>
      `<li><a ${isActive ? 'class= "active"' : ''}>${text}</a></li>`;
    const domListString = data.reduce((acc, cur, index) => {
      return (acc += baseTemplateItem(cur.videoName, index == 0 ? true : false));
    }, '');
    domSideMenu.innerHTML = domListString;
    const childList = Array.from(domSideMenu.childNodes);
    let curActiveDom = (childList[0] as Element).firstChild as Element;
    domSideMenu.addEventListener('click', (e) => {
      if (e.target) {
        curActiveDom?.classList.remove('active');
        (e.target as Element).classList.add('active');
        curActiveDom = e.target as Element;
      }
    });
  }
};

renderList();
