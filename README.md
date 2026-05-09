# ExamStack

大学生期末资料共享平台，包含完整前后端：

- 前端：React 19 + React Router 7 + Tailwind CSS 4 + shadcn/ui + Mantine UI + axios + ahooks + zustand
- 后端：FastAPI + SQLAlchemy + Pydantic + JWT + Alembic
- 默认数据库：PostgreSQL

## 功能

- 用户注册、登录、JWT 认证
- 资料上传、在线预览、下载
- 资料广场、分类筛选、关键词搜索
- 积分系统：上传 +5，下载 -5
- 个人中心、我的上传、我的积分
- 路由守卫、未登录拦截
- 统一响应体、全局异常处理、服务层分层

## 目录

- 前端：`E:\ExamStack\frontend`
- 后端：`E:\ExamStack\backend`

## 启动后端

1. 进入项目根目录 `E:\ExamStack`
2. 安装依赖

```powershell
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

3. 启动服务

```powershell
$env:PYTHONPATH="E:\ExamStack\backend"
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

后端默认配置文件：`E:\ExamStack\backend\.env`

## 运行数据库迁移

1. 进入 `E:\ExamStack\backend`
2. 安装依赖，确保带上 `alembic`
3. 确认 `backend\.env` 里的 `DATABASE_URL` 指向你的 PostgreSQL
4. 生成迁移

```powershell
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "init"
```

5. 执行迁移

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

常用命令：

```powershell
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -m alembic history
.\.venv\Scripts\python.exe -m alembic downgrade -1
```

## 启动前端

1. 进入 `E:\ExamStack\frontend`
2. 如需自定义接口地址，可先复制 `frontend\.env.example` 为 `.env`
3. 启动开发服务器

```powershell
pnpm dev
```

默认前端地址通常为：

- `http://127.0.0.1:5173`

## 测试与构建

后端测试：

```powershell
$env:PYTHONPATH="E:\ExamStack\backend"
backend\.venv\Scripts\python.exe -m pytest -vv backend\tests
```

前端构建：

```powershell
cd frontend
pnpm build
```

## 说明

- 当前后端默认通过 `DATABASE_URL` 连接 PostgreSQL，并使用 Alembic 管理表结构变更。
- 文件上传目录为 `backend/app/static/uploads/`。
- 前端采用“活跃的校园共享社区”视觉方向，偏年轻、明亮、社区感强。
