let client = null; // MQTT 클라이언트의 역할을 하는 Client 객체를 가리키는 전역변수
let connectionFlag = false; // 연결 상태이면 true
let userName;

function startConnect() { // 브로커에 접속하는 함수
	// 재로그인 시도 시
	if(connectionFlag == true) {
		subscribe("presence"); // 'presence' 토픽 구독
		publish("check", userName); // 'check' 토픽으로 사용자 ID 발행
	}

	let broker = "localhost";
	let port = 9001;
	
	userName = document.getElementById("inputName").value.trim();

	// MQTT 메시지 전송 기능을 모두 가징 Paho client 객체 생성
	client = new Paho.MQTT.Client(broker, Number(port), userName);

	// client 객체에 콜백 함수 등록 및 연결
	client.onConnectionLost = onConnectionLost; 
	client.onMessageArrived = onMessageArrived;

	// client 객체에게 브로커에 접속 지시
	client.connect({
		onSuccess: function () {
			connectionFlag = true;
			subscribe("presence"); // 'presence' 토픽 구독
			publish("check", userName); // 'check' 토픽으로 사용자 ID 발행
		},
		onFailure: function (error) {
            connectionFlag = false;
		}
	});
}

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
	connectionFlag = true; // 연결 상태로 설정
}

function subscribe(topic) {
	if(connectionFlag != true) { // 연결되지 않은 경우
		return false;
	}

	client.subscribe(topic); // 브로커에 구독 신청
}

function publish(topic, msg) {
	if(connectionFlag != true) { // 연결되지 않은 경우
		return false;
	}
	client.send(topic, msg, 0, false);
}

function unsubscribe(topic) {
	if(connectionFlag != true) return; // 연결되지 않은 경우
	
	client.unsubscribe(topic, null); // 브로커에 구독 신청 취소
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // responseObject는 응답 패킷
	if (responseObject.errorCode !== 0) {
		document.getElementById("messages").innerHTML = '<span>오류 : ' + responseObject.errorMessage + '</span><br/>';
	}
	connectionFlag = false; // 연결 되지 않은 상태로 설정
}

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
	if(msg.destinationName == "presence") {
		if(msg.payloadString == "false") {
			unsubscribe("presence");
			userName = "";
			document.getElementById("loginError").style.visibility = "visible";
			document.getElementById("userName").style.color = "red";
			document.getElementById("loginButton").style.color = "red";
		}
		else if(msg.payloadString == "true") {
			document.getElementById("screenStyleSheet").setAttribute('href', 'mainScreen.css');
			document.getElementById("userName").innerHTML = "<b>" + userName + "</b>";
			/*document.getElementById("inputName").style.display = "none";
			document.getElementById("loginButton").style.display = "none";
			*/
			document.getElementById("userName").style.color = "white";
			document.getElementById("loginError").style.visibility = "hidden";
			for (let i = 0; i < hiddenItems.length; i++) {
				hiddenItems[i].style.display = "inline";
			}
			startStreaming();
		}
	}
	else if(msg.destinationName == "image") {
		//console.log(“received”)
		drawImage(msg.payloadString); // 메시지에 담긴 파일 이름으로 drawImage() 호출. drawImage()는 웹 페이지에 있음
		// document.getElementById("merakiCam").src = msg.payloadString;
    }
	else if(msg.destinationName == "result") {
		document.getElementById("loading").setAttribute('href', '');
		document.getElementById("screenStyleSheet").setAttribute('href', 'analysisScreen.css'); // 분석 결과 화면으로 전환 
		document.getElementById("info").innerHTML = "분류 결과";
		let msgString = msg.payloadString.split(",");
		document.getElementById("plasticCount").innerHTML = parseInt(msgString[0]) + "개";
		document.getElementById("canCount").innerHTML = parseInt(msgString[1]) + "개";
		document.getElementById("glassCount").innerHTML = parseInt(msgString[2]) + "개";

		/*if(plasticCount == 1) {
			total++;
			intervalId = setInterval(function() {
				moveImageDown('plastic', './plastic.png');
			}, 300);
		} else if(canCount == 1) {
			total++;
			intervalId = setInterval(function() {
				moveImageDown('can', './can.png');
			}, 300);
		} else if(glassCount == 1) {
			total++;
			intervalId = setInterval(function() {
				moveImageDown('glass', './glass.png');
			}, 300);
		}*/
	}
}

// disconnection 버튼이 선택되었을 때 호출되는 함수
function startDisconnect() {
	if(connectionFlag == false) 
		return; // 연결 되지 않은 상태이면 그냥 리턴
	stopStreaming();
	userName = "";
	document.getElementById("screenStyleSheet").setAttribute('href', 'homeScreen.css');
	document.getElementById("inputName").value = "";
	client.disconnect(); // 브로커와 접속 해제
	connectionFlag = false; // 연결 되지 않은 상태로 설정
}