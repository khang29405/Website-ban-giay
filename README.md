# Website ban giay the thao

Frontend HTML/CSS/JavaScript thuan + Backend Node.js/Express (kien truc phan tang) + SQL Server. Xac thuc bang JWT.

## Cau truc thu muc

```
database/   scripts SQL (tao bang + du lieu mau)
backend/    Node.js/Express API (co npm)
frontend/   HTML/CSS/JS thuan (khong dung npm)
```

## Yeu cau moi truong

- Node.js 18+ (khuyen nghi ban LTS)
- SQL Server (Express hoac ban day du), co the truy cap qua SSMS
- Mot client goi API de test: Postman / Thunder Client / curl

## 1. Chuan bi database

1. Mo `database/ShoeStoreDB.sql` bang SSMS, chay toan bo file de tao database `ShoeStoreDB`, 8 bang va du lieu mau.
2. Ghi lai thong tin ket noi SQL Server cua may ban: ten server (vi du `localhost` hoac `localhost\SQLEXPRESS` neu dung named instance), tai khoan dang nhap (vi du `sa`), mat khau.
   - Neu dung named instance (vd `SQLEXPRESS`), phai bat SQL Server Authentication (Mixed Mode), enable login `sa` va dam bao dich vu **SQL Server Browser** dang chay.

## 2. Chay Backend

Moi thanh vien tu cau hinh ket noi database cua may minh — **khong commit file `.env` that len GitHub**.

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Mo `backend/.env` vua tao va dien thong tin that cua may ban:

```
PORT=5000

DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS   # chi can dong nay neu dung named instance, xoa neu dung instance mac dinh
DB_PORT=1433              # bo qua neu da dung DB_INSTANCE
DB_NAME=ShoeStoreDB
DB_USER=sa
DB_PASSWORD=<mat khau SQL Server cua ban>
DB_ENCRYPT=false

JWT_SECRET=<chuoi bi mat ngau nhien, tuy y>
JWT_EXPIRES_IN=1d
```

Chay server:

```bash
npm run dev      # tu restart khi sua code (nodemon)
# hoac
npm start
```

Kiem tra: mo `http://localhost:5000/api/health`, phai thay `{"success":true,"data":{"server":"up","db":"connected"}}`.

## Xu ly loi thuong gap khi ket noi SQL Server

Neu goi `/api/health` ma bao `{"success":false,"message":"DB connection failed"}`, kiem tra lan luot cac loi thuong gap sau (deu xuat phat tu named instance nhu `SQLEXPRESS`):

** Lam het cach 1-3 neu loi **

**1. Loi `ETIMEOUT: Failed to connect to localhost\SQLEXPRESS in 15000ms`**
Nguyen nhan: dich vu **SQL Server Browser** dang Stopped — day la dich vu bat buoc de client tim ra port cua named instance.
Cach fix: `Win + R` → `services.msc` → tim **SQL Server Browser** → chuot phai → **Properties** → Startup type = **Automatic** → **Start**.

**2. Loi `Port for SQLEXPRESS not found in localhost`**
Nguyen nhan: giao thuc **TCP/IP** dang bi tat cho instance (mac dinh SQL Express chi bat Shared Memory/Named Pipes, khong bat TCP/IP).
Cach fix: mo **SQL Server Configuration Manager** → **SQL Server Network Configuration** → **Protocols for SQLEXPRESS** → chuot phai **TCP/IP** → **Enable** → sau do **restart dich vu SQL Server (SQLEXPRESS)** trong `services.msc` de ap dung.

**3. Dien sai `DB_SERVER` khi dung named instance**
Khong duoc gop `TEN_MAY\SQLEXPRESS` chung vao `DB_SERVER` (package `mssql` khong tu tach duoc). Phai tach rieng:
```
DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS
```

**4. Dang nhap `sa` bi tu choi**
Nguyen nhan: SQL Server mac dinh chi bat Windows Authentication, tai khoan `sa` dang bi disable.
Cach fix: SSMS → chuot phai server goc → **Properties → Security** → chon **SQL Server and Windows Authentication mode** → OK → **Security → Logins → sa** → Properties → dat mat khau (tab General) + Login = Enabled (tab Status) → restart dich vu SQL Server.

## 3. Chay Frontend

Khong can npm/build. Mo truc tiep `frontend/html/index.html` bang trinh duyet, hoac dung mot static server don gian (vd extension "Live Server" cua VS Code) de tranh loi CORS/file://.

`frontend/js/main.js` co bien `API_BASE_URL` tro ve `http://localhost:5000/api` — sua lai neu backend chay port khac.

## Quy uoc lam viec nhom

- Nhanh: `main` la nhanh chinh, moi task tao nhanh rieng `feat/SCRUM-xx-...`, merge xong thi xoa nhanh.
- Commit: `type(scope): SCRUM xx mo ta ngan` (vd `feat(auth): SCRUM-17 dang nhap JWT`), commit nho va thuong xuyen, khong don vao ngay cuoi sprint.
- Khong commit file `backend/.env` (da bi `.gitignore` chan) — chi commit `backend/.env.example`.
