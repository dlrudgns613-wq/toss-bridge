<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Split 정산서</title>
    <style>
        /* 스타일은 아까 마음에 들어하셨던 '토스 스타일' 그대로 유지합니다 */
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F2F4F6; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 500px; margin: 0 auto; }
        .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .names { font-size: 17px; font-weight: 700; margin-bottom: 8px; color: #191F28; line-height: 1.4; }
        .details-text { font-size: 13px; color: #8B95A1; margin-bottom: 12px; line-height: 1.5; }
        .details-highlight { color: #4E5968; font-weight: 600; }
        .price-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; }
        .price-info { display: flex; flex-direction: column; }
        .total-price { font-size: 20px; font-weight: 700; color: #3182F6; }
        .per-person { font-size: 12px; color: #8B95A1; margin-top: 4px; }
        .send-btn { background-color: #3182F6; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
        .send-btn:active { background-color: #1B64DA; }
        .receipt-details { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #C5C8CE; }
        .receipt-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .receipt-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #666; }
        #loading { text-align: center; margin-top: 50px; font-size: 14px; color: #888; }
    </style>
</head>
<body>

<div class="container">
    <div id="loading">정산 내역을 불러오는 중...</div>
    <div id="content" style="display: none;"></div>
</div>

<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

<script src="js/firebase-config.js"></script>

<script>
    // 3. 설정 파일에 있는 함수로 DB 시작!
    // (이제 여기에 API 키 같은 건 적을 필요 없습니다)
    const db = initFirebase();

    // 혹시 모를 연결 오류 방지 (와이파이 등)
    db.settings({ experimentalForceLongPolling: true });

    // --- 아래는 데이터 로딩 및 화면 그리기 로직 (동일함) ---
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (!docId) {
        document.getElementById('loading').innerText = "잘못된 접근입니다.";
    } else {
        loadData(docId);
    }

    function loadData(id) {
        db.collection('receipts').doc(id).get().then((doc) => {
            if (doc.exists) {
                renderApp(doc.data());
            } else {
                document.getElementById('loading').innerText = "삭제되거나 없는 정산서입니다.";
            }
        }).catch((error) => {
            console.error("Error:", error);
            // 에러 나면 화면에 이유 출력
            document.getElementById('loading').innerText = "오류: " + error.message;
        });
    }

    function renderApp(data) {
        document.getElementById('loading').style.display = 'none';
        const container = document.getElementById('content');
        container.style.display = 'block';

        let groups = {};
        let memberDetails = {}; 

        data.members.forEach(m => {
            let amt = m.amount;
            if(!groups[amt]) groups[amt] = [];
            groups[amt].push(m.name);

            // "2차(멜론)" 상세 내역 로직
            let myHistory = [];
            data.details.forEach((round, rIdx) => {
                let roundName = round.rName || (rIdx + 1) + "차";
                let totalItems = round.items.length;
                let myItems = round.items.filter(item => !item.eaters || item.eaters.includes(m.name));

                if (myItems.length === totalItems && totalItems > 0) {
                     myHistory.push(roundName); 
                } else if (myItems.length > 0) {
                    let itemNames = myItems.map(i => i.iName);
                    let detailStr = itemNames[0];
                    if (itemNames.length > 1) detailStr += ` 외 ${itemNames.length - 1}건`;
                    myHistory.push(`${roundName}(${detailStr})`);
                }
            });
            memberDetails[m.name] = myHistory.join(", ");
        });

        let sortedAmounts = Object.keys(groups).sort((a, b) => b - a);

        sortedAmounts.forEach(amt => {
            let members = groups[amt];
            let price = parseInt(amt);
            if (price === 0) return; 

            let card = document.createElement('div');
            card.className = 'card';

            let namesHtml = members.join(', ');
            let desc = memberDetails[members[0]] || "내역 없음";

            let perPersonHtml = '';
            if (members.length > 1) {
                perPersonHtml = `<div class="per-person">${members.length}명 / 1인 ${price.toLocaleString()}원</div>`;
            }

            let tossLink = `toss://send?amount=${price}&msg=${encodeURIComponent(data.title)}`;

            card.innerHTML = `
                <div class="names">${namesHtml}</div>
                <div class="details-text">
                    <span class="details-highlight">참여:</span> ${desc}
                </div>
                <div class="price-row">
                    <div class="price-info">
                        <div class="total-price">${(price * members.length).toLocaleString()}원</div>
                        ${perPersonHtml}
                    </div>
                    <a href="${tossLink}" class="send-btn">송금</a>
                </div>
            `;
            container.appendChild(card);
        });

        let detailsDiv = document.createElement('div');
        detailsDiv.className = 'receipt-details';
        detailsDiv.innerHTML = `<div class="receipt-title">📋 전체 상세 지출 내역</div>`;
        data.details.forEach(r => {
            detailsDiv.innerHTML += `<div style="font-weight:bold; margin-top:10px; font-size:13px;">${r.rName}</div>`;
            r.items.forEach(i => {
                detailsDiv.innerHTML += `
                    <div class="receipt-row">
                        <span>- ${i.iName}</span>
                        <span>${i.price.toLocaleString()}원</span>
                    </div>`;
            });
        });
        container.appendChild(detailsDiv);
    }
</script>
</body>
</html>
