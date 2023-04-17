const API_KEY = 'xeZqhOihrhlYwG5rIbVg7EWsNJvuPYuPH3jqzBlXCtSYdxWFDXVqWGXdS7oS7%2B%2FVsWSt4CNky1VPj1Xuu9FCFw%3D%3D'
//api키값
let lostPeriodStart = document.getElementById("lost-periodStart");
let lostPeriodEnd = document.getElementById("lost-periodEnd");
//1번 url을 위한 변수
let lostName = document.getElementById("lost-name");
let lostSpot;
//2번 url을 위한 변수
let lostId = document.getElementById("lost-id");
//3번 url을 위한 변수
let totalSearch = document.querySelector(".total-search");
totalSearch.addEventListener("click", ()=>searchByInformation());
//검색 버튼 눌렀을 때
let placeChoose = document.querySelectorAll(".dropdown-place-item");
placeChoose.forEach((place)=>place.addEventListener("click", (event)=>pushPlaceHolder(event)));
let spotChoose = document.querySelectorAll(".dropdown-spot-item");
spotChoose.forEach((spot)=>spot.addEventListener("click", (event)=>pushSpotHolder(event)));
//장소/지역을 눌렀을 때 창에 값을 대입
let popBtn = document.getElementById("pop-btn");
let popLayer= document.querySelector(".popUp");
let popOpenBtn = document.querySelector(".searchBtn");
popOpenBtn.addEventListener("click", ()=>{popLayer.style.display = "block"});
popBtn.addEventListener("click", ()=>{popLayer.style.display = "none"});
//팝업창
let layerChoose = document.querySelectorAll(".pop-left");
layerChoose.forEach((item)=>{item.addEventListener("click", (event)=>searchLowLayer(event))});
//하위물품을 눌렀을 때
let page = 1;
//페이지네이션
let topLayer; //상위물품명
let topLayerId; //상위물품코드
let lowLayer; //하위물품명
let lowLayerId;//하위물품코드
let lostPlace; //분실지역코드
let lostIdList = []; //관리ID리스트
let lostSpotId; //장소ID
let firstLostIdList = []; //1번url데이터ID리스트
let secondLostIdList = []; //2번url데이터ID리스트
let latestIdList = []; //최근 분실물 ID리스트
let checkFuncUse = 1; 
let latestImgList =[]; //최근 분실물 이미지 리스트
let latestNameList =[]; //최근 분실물명 리스트
let latestYmdList =[]; //최근 분실물 일자 리스트
let prevTimes = 5;
let nextTimes = 0;

const searchByInformation = async() => {
    let url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsInfoAccToClAreaPd?serviceKey=${API_KEY}&numOfRows=10&pageNo=${page}`);
    if(topLayer){ //1번 url
        url.searchParams.set('PRDT_CL_CD_01', topLayerId);
        url.searchParams.set('PRDT_CL_CD_02', lowLayerId);
    }
    if(lostPeriodStart.value){ //1번 url
        url.searchParams.set('START_YMD',lostPeriodStart.value);
    }
    if(lostPeriodEnd.value){ //1번 url
        url.searchParams.set('END_YMD',lostPeriodEnd.value);
    }
    if(lostPlace){ //1번 url
        url.searchParams.set('LST_LCT_CD', lostPlace);
    }
    if(lostId.value){ //3번 url
        url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsDetailInfo?serviceKey=${API_KEY}`)
        url.searchParams.set('ATC_ID',lostId.value);
    }
    let response = await fetch(url);
    let text = await response.text();
    let xml = new DOMParser().parseFromString(text, 'application/xml');
    console.log(xml);
    let items = xml.getElementsByTagName("atcId");
    lostIdList =[];
    firstLostIdList = [];
    for(i=0;i<items.length;i++){
        firstLostIdList.push(items.item(i).firstChild.nodeValue);
    }
    console.log("firstId:",firstLostIdList);
    if(lostName.value || lostSpot){ //2번 url
        //console.log("!!!!!!!!!!!!!!11");
        searchBySecondUrl();
    }
    else{
        lostIdList = firstLostIdList;
        //console.log("Id:",lostIdList);
        renderLostList();
    }
}
const searchBySecondUrl=async()=>{
    let url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsInfoAccTpNmCstdyPlace?serviceKey=${API_KEY}&numOfRows=10&pageNo=${page}`)
    if(lostName.value){
        url.searchParams.set('LST_PRDT_NM',lostName.value);
    }
    if(lostSpot){
        url.searchParams.set('LST_PLACE',lostSpot);
    }
    let response = await fetch(url);
    let text = await response.text();
    let xml = new DOMParser().parseFromString(text, 'application/xml');
    let items = xml.getElementsByTagName("atcId");
    secondLostIdList = [];
    for(let i=0;i<items.length;i++){
        secondLostIdList.push(items.item(i).firstChild.nodeValue);
    }
    for(let i=0;i<items.length;i++){
        for(let j=0;j<items.length;j++){
            if(firstLostIdList[i] == secondLostIdList[j]){
                lostIdList.push(firstLostIdList[i])
            }
        }
    }
    renderLostList();
}
const pushPlaceHolder=(event)=>{
    let chsPlace = event.target.innerText;
    let input = document.querySelector(".place-btn");
    input.innerText = chsPlace;
    lostPlace = event.target.id;
}
const pushSpotHolder=(event)=>{
    lostSpot = event.target.innerText;
    let input = document.querySelector(".spot-btn");
    input.innerText = lostSpot;
    lostSpotId = event.target.id;
}
const searchLowLayer=(event)=>{
    topLayer = event.target.innerText;
    let lowLayerHTML = '';
    let lowLayerList = [];
    switch(topLayer){
        case "가방":
            lowLayerList.push(['여성용가방','PRA100'], ['남성용가방','PRA200'], ['기타가방','PRA300']);
            topLayerId = 'PRA000'
            break;
        case "귀금속":
            lowLayerList.push(['반지','PRO100'],['목걸이','PRO200'],['귀걸이','PRO300'],['시계','PRO400'],['기타','PRO500'])
            topLayerId = 'PRO000'
            break;
        case "도서용품":
            lowLayerList.push(['학습서적','PRB100'], ['소설','PRB200'],['컴퓨터서적','PRB300'],['만화책','PRB400'], ['기타서적','PRB500'])
            topLayerId = 'PRB000'
            break;
        case "서류":
            lowLayerList.push(['서류','PRC100'], ['기타물품','PRC200'])
            topLayerId = 'PRC000'
            break;
        case "산업용품":
            lowLayerList.push(['기타물품','PRD100'])
            topLayerId = 'PRD000'
            break;
        case "쇼핑백":
            lowLayerList.push(['쇼핑백','PRQ100'])
            topLayerId = 'PRQ000'
            break;
        case "스포츠용품":
            lowLayerList.push(['스포츠용품','PRE100'])
            topLayerId = 'PRE000'
            break;
        case "악기":
            lowLayerList.push(['건반악기','PRR100'],['관악기','PRR200'],['타악기','PRR300'],['현악기','PRR400'],['기타악기','PRR500'])
            topLayerId = 'PRR000'
            break;
        case "유가증권":
            lowLayerList.push(['어음','PRM100'],['상품권','PRM200'],['채권','PRM300'],['기타','PRM400'])
            topLayerId = 'PRM000'
            break;
        case "의류":
            lowLayerList.push(['여성의류','PRK100'],['남성의류','PRK200'],['아기의류 모자','PRK300'],['신발','PRK400'],['기타의류','PRK500'])
            topLayerId = 'PRK000'
            break;
        case "자동차":
            lowLayerList.push(['자동차열쇠','PRF100'],['네비게이션','PRF200'],['자동차번호판','PRF300'],['임시번호판','PRF400'],['기타용품','PRF500'])
            topLayerId = 'PRF000'
            break;
        case "전자기기":
            lowLayerList.push(['태블릿','PRG100'],['스마트워치','PRG200'],['무선이어폰','PRG300'],['카메라','PRG400'],['기타용품','PRG500'])
            topLayerId = 'PRG000'
            break;
        case "지갑":
            lowLayerList.push(['여성용 지갑','PRH100'],['남성용 지갑','PRH200'],['기타 지갑','PRH300'])
            topLayerId = 'PRH000'
            break;
        case "증명서":
            lowLayerList.push(['신분증','PRN100'],['면허증','PRN200'],['여권','PRN300'],['기타','PRN400'])
            topLayerId = 'PRN000'
            break;
        case "컴퓨터":
            lowLayerList.push(['삼성노트북','PRI100'],['LG노트북','PRI200'],['애플노트북','PRI300'],['기타','PRI400'])
            topLayerId = 'PRI000'
            break;
        case "카드":
            lowLayerList.push(['신용(체크)카드','PRP100'],['일반카드','PRP200'],['기타카드','PRP300'])
            topLayerId = 'PRP000'
            break;
        case "현금":
            lowLayerList.push(['현금','PRL100'],['수표','PRL200'],['외화','PRL300'],['기타','PRL400'])
            topLayerId = 'PRL000'
            break;
        case "휴대폰":
            lowLayerList.push(['삼성휴대폰','PRJ100'],['LG휴대폰','PRJ200'],['아이폰','PRJ300'],['기타휴대폰','PRJ400'],['기타통신기기','PRJ500'])
            topLayerId = 'PRJ000'
            break;
        case "기타물품":
            lowLayerList.push(['안경','PRZ100'],['선글라스','PRZ200'],['매장문화재','PRZ300'],['기타','PRZ400'])
            topLayerId = 'PRZ000'
            break;
        case "유류품":
            lowLayerList.push(['유류품','PRX100'])
            topLayerId = 'PRX000'
            break;
    }
    for(let i=0; i<lowLayerList.length; i++){
        lowLayerHTML += `<li id="${lowLayerList[i][1]}" onclick="fillInText(event)">${lowLayerList[i][0]}</li>`
    }
    document.querySelector(".pop-right").innerHTML = lowLayerHTML;
}
const fillInText=(event)=>{
    popLayer.style.display = "none";
    lowLayer = event.target.innerText;
    lowLayerId = event.target.id;
    let lostCate = document.getElementById("lost-cate");
    lostCate.innerText = `${topLayer} - ${lowLayer}`;
}
const renderLostList=async()=>{
    let lostListHTML = '';
    lostListHTML = `
        <table>
            <th>관리번호</th>
            <th>습득물명</th>
            <th>보관장소</th>
            <th>연락처</th>
            <th>주운일자</th>
    `
    for(let i=0;i<lostIdList.length;i++){
        let url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsDetailInfo?serviceKey=${API_KEY}`)
        url.searchParams.set('ATC_ID',lostIdList[i]);
        let response = await fetch(url);
        let text = await response.text();
        let xml = new DOMParser().parseFromString(text, 'application/xml');
        let lostNm = xml.getElementsByTagName("lstPrdtNm");
        let orgNm = xml.getElementsByTagName("orgNm");
        let orgTel = xml.getElementsByTagName("tel");
        let lostYmd = xml.getElementsByTagName("lstYmd");
        lostListHTML += `
            <tr>
                <td>${lostIdList[i]}</td>
                <td>${lostNm.item(0).firstChild.nodeValue}</td>
                <td>${orgNm.item(0).firstChild.nodeValue}</td>
                <td>${orgTel.item(0).firstChild.nodeValue}</td>
                <td>${lostYmd.item(0).firstChild.nodeValue}</td>
            </tr>
        `
    }
    lostListHTML += `</table>`
    document.getElementById("lost-list-area").innerHTML = lostListHTML;
    document.getElementById("lost-list-area").style.border = "3px solid #2d6bba";
    renderPage();
}
const renderPage =() => {
    let pageHTML='';
    let pageGroup = Math.ceil(page/10);
    let totalHits = lostIdList.length;
    let last = page;
    let first = (pageGroup-1)*10 +1;
    if(page > 1){
        pageHTML += `
            <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous" onclick="pageClick(${page-1})">
                    <span aria-hidden="true">&lt;</span>
                </a>
            </li>
        `
    }
    for(let i=first;i<last+1;i++){
        pageHTML += `
        <li class="${i==page?"active":""} page-item">
            <a class="page-link" href="#" onclick="pageClick(${i})">${i}</a>
        </li>
        `
    }
    if(totalHits == 10){
        pageHTML += `
        <li class="page-item">
        <a class="page-link" href="#" aria-label="Next" onclick="pageClick(${page+1})">
            <span aria-hidden="true">&gt;</span>
        </a>
        </li>
        `
    }
    document.querySelector(".pagination").innerHTML = pageHTML;
}
const pageClick = (pageNum)=>{
    page = pageNum;
    console.log(page);
    searchByInformation();
}
const renderLatestList=async(checkFuncUse)=>{
    if(checkFuncUse != "next" && checkFuncUse != "prev"){
        //날짜
        let today = new Date();
        let year = today.getFullYear();
        let month = ('0'+ (today.getMonth() + 1)).slice(-2);
        let day = ('0' + today.getDate()).slice(-2);
        let yesterday = ('0' + (today.getDate()-1)).slice(-2);
        let todayDateString = year+month+day;
        let yesterdayDateString = year+month+yesterday;
        //날짜 endpoint사용을 위해서 1번 url 사용
        //1번 url에서 id데이터 빼오기
        let url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsInfoAccToClAreaPd?serviceKey=${API_KEY}&numOfRows=100&START_YMD=${yesterdayDateString}&END_YMD=${todayDateString}`);
        let response = await fetch(url);
        let text =  await response.text();
        let xml = new DOMParser().parseFromString(text, 'application/xml');
        let items = xml.getElementsByTagName("atcId");
        latestIdList=[];
        for(i=0;i<items.length;i++){
            latestIdList.push(items.item(i).firstChild.nodeValue);
        }
        //분실물 이미지를 가져오기 위해서 3번 url 사용
        let latestNum = 0; //이미지가 있는 분실물만 가져오고 10가 채워지면 for문을 끝내기
        for(let i=0;i<latestIdList.length;i++){
            let url = new URL(`http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsDetailInfo?serviceKey=${API_KEY}`) //3번 url
            url.searchParams.set('ATC_ID',latestIdList[i]);
            let response = await fetch(url);
            let text = await response.text();
            let xml = new DOMParser().parseFromString(text, 'application/xml');
            let latestImg = xml.getElementsByTagName("lstFilePathImg");
            let latestName  = xml.getElementsByTagName("lstPrdtNm");
            let latestYmd = xml. getElementsByTagName("lstYmd");
            if(latestImg.item(0).firstChild.nodeValue != "https://www.lost112.go.kr/lostnfs/images/sub/img04_no_img.gif"){
                latestImgList.push(latestImg.item(0).firstChild.nodeValue);
                latestNameList.push(latestName.item(0).firstChild.nodeValue);
                latestYmdList.push(latestYmd.item(0).firstChild.nodeValue);
                latestNum++;
            }
            if(latestNum == 10){break;}
        }
    }
    if(checkFuncUse == "next"){
        let shiftImg = latestImgList.shift();
        latestImgList.push(shiftImg);
        let shiftName = latestNameList.shift();
        latestNameList.push(shiftName);
        let shiftYmd = latestYmdList.shift();
        latestYmdList.push(shiftYmd);
    }
    if(checkFuncUse == "prev"){
        let popImg = latestImgList.pop();
        latestImgList.unshift(popImg);
        let popName = latestNameList.pop();
        latestNameList.unshift(popName);
        let popYmd = latestYmdList.pop();
        latestYmdList.unshift(popYmd);
    }
    let latestHTML = "";
    latestHTML = `
        <h5>최근 등록된 습득물</h5>
        <div class="latest-list">
            <button onclick="prevBtn()">&lt;</button>
            <div class="main-latest">
            <ul>
    `
    for(let i=0;i<10;i++){
        latestHTML += `
        <li>
            <img src="${latestImgList[i]}"/>
            <p class="latest-list-name">${latestNameList[i]}</p>
            <p class="latest-list-ymd">습득일자: ${latestYmdList[i]}</p>
        </li>
        `
    }
    latestHTML += `
            </ul>
        </div>
        <button onclick="nextBtn()">&gt;</button>
    </div>
    `
    document.querySelector("aside").innerHTML = latestHTML;
}
const nextBtn = () =>{
    checkFuncUse = "next"; //renderLatestList()에 들어가서 latestIdList을 바꿔줘야 하기 때문에 버튼을 눌렀을때
    //latestIdList가 만들어지는 과정을 건너뜀
    if(nextTimes<5){
        prevTimes--;
        nextTimes++;
        renderLatestList(checkFuncUse);
    }
}
const prevBtn = () =>{
    checkFuncUse = "prev";
    if(prevTimes<5){
        prevTimes++;
        nextTimes--;
        renderLatestList(checkFuncUse);
    }
}
searchByInformation();
renderLatestList();