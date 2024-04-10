<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %> 
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ecosmetic Bin 회원가입</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            color: #666666;
        }

        .container {
            text-align: center;
            display: flex;
            flex-direction: column;
            position: relative;
            width: 80%;
            margin: 10vh auto;
        }

        input[type="text"],
        input[type="submit"] {
            width: 90%;
            max-width: 400px;
            height: 2.5em;
            margin: 5px;
            border-radius: 10px;
            border: 2px solid #55C595;
            padding: 10px;
            font-size: 20px;
        }
        
        input[type="text"].error {
            border-color: red;
        }
        
        input[type="submit"] {
            background-color: #55C595;
            color: white;
            height: 3em;
            width: 330px;
        }
        
        .search-container {
            display: flex;
            align-items: center;
            flex-direction: column;
            position: relative;
        }

        #message {
            position: absolute;
            top: 80px;
            left: 2%;
            color: red;
            font-size: 1vh;
        }

        #success-message {
            position: absolute;
            top: 80px;
            left: 2%;
            color: #55C595;
            font-size: 1vh;
        }
		
		.success {
        	color: #55C595;
    	}
    	
        .error {
            border-color: red;
        }

        @media only screen and (max-width: 600px) {
            input[type="text"] {
                width: 90%;
                max-width: none;
                height: 10vw;
                font-size: 5vw;
            }
        }
    </style>
</head>

<%
    String url = "jdbc:mysql://localhost:3306/ecosmeticbin";
    String username = "root";
    String password = "1234";

    String id = request.getParameter("id");

    String message = null;

    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet rs = null;

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, username, password);

        if (id != null && !id.isEmpty()) {
            String checkExistingUserSql = "SELECT * FROM user WHERE id=?";
            stmt = conn.prepareStatement(checkExistingUserSql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                message = "이미 가입된 아이디입니다.";
            } else {
                String insertUserSql = "INSERT INTO user (id, totalmileage, level) VALUES (?, 0, 1)";
                stmt = conn.prepareStatement(insertUserSql);
                stmt.setString(1, id);

                int rowsAffected = stmt.executeUpdate();

                if (rowsAffected > 0) {
                    message = "회원가입 성공! 로그인 해주세요";
                } else {
                    message = "회원가입 실패!";
                }
            }
        }
    } catch (SQLException | ClassNotFoundException e) {
        e.printStackTrace();
        message = "오류 발생: " + e.getMessage(); // 선택적으로 오류 메시지 설정.
    } finally {
        try {
            if (stmt != null) stmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        try {
            if (rs != null) rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        try {
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
%>
<body class="container">
    <div style="text-align: center;">
        <p style="font-size: 30px;">Welcome!</p>
        <img src="logo.png" style="width: 200px; height: auto;">
        <p style="font-size: 10px;">회원 서비스 이용을 위해 회원가입을 진행해주세요. </p>
        <br><br>
        <form action="" method="post">
            <div class="search-container">
                <div>
    <input type="text" id="id" name="id" placeholder="아이디" class="<%= message != null ? (message.equals("회원가입 성공! 로그인 해주세요") ? "success" : "error") : "" %>">
			</div>
			<% if(message != null && message.equals("회원가입 성공! 로그인 해주세요")) { %>
    			<div id="success-message" class="success"><%= message %></div>
			<% } else if(message != null) { %>
    			<div id="message" class="error"><%= message %></div>
			<% } %><br>
                <input type="submit" value="회원가입">
            </div>
        </form>
    </div>
    <button type="button" onclick="location.href='ecomesticBin.jsp'">로그인으로 이동</button>
</body>
</html>
