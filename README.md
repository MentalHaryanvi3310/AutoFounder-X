# AutoFounder X 🚀

A full-stack SaaS application that helps entrepreneurs generate startup ideas, create MVP plans, and manage their startup journey using AI.

## Features

### ✅ Completed Features
- **User Authentication**: Secure signup/login with JWT tokens
- **AI Idea Generator**: Generate unique startup ideas based on user interests
- **MVP Planner**: Create comprehensive development plans for startup ideas
- **Project Management**: Store and manage generated ideas and plans
- **Modern UI/UX**: Clean, responsive design with ShadCN UI components

### 🎯 Core Functionality

#### 1. User Authentication
- Secure registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

#### 2. AI-Powered Tools
- **Idea Generator**: Uses OpenAI GPT-3.5 to create startup ideas
- **MVP Planner**: Generates step-by-step development plans
- **Persistent Storage**: Saves all generated content to PostgreSQL

#### 3. Dashboard Features
- **Overview**: Statistics and quick actions
- **AI Tools**: Interactive forms for idea and MVP generation
- **Projects**: View all generated ideas and plans
- **Responsive Design**: Works on all devices

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **ShadCN UI** components
- **React Hooks** for state management

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **OpenAI API** for AI features
- **JWT** for authentication

### Security
- **bcrypt** for password hashing
- **JWT tokens** for session management
- **Input validation** with Zod
- **CORS protection**

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd autofounder-x
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
Create a `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/autofounder_x"
JWT_SECRET="your-super-secure-jwt-secret"
OPENAI_API_KEY="your-openai-api-key"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### AI Features
- `POST /api/ai/idea` - Generate startup idea
- `POST /api/api/mvp` - Generate MVP plan

### Projects
- `GET /api/projects` - Get user's projects

## Usage Guide

### 1. Sign Up
- Visit `http://localhost:8000/auth/signup`
- Create an account with email and password

### 2. Generate Ideas
- Go to Dashboard → AI Tools tab
- Enter a topic or interest
- Click "Generate Idea" to get AI-powered startup ideas

### 3. Create MVP Plans
- Select a project from the list
- Click "Generate MVP" to create a development plan
- View detailed steps and requirements

### 4. Manage Projects
- View all generated ideas and plans in the Projects tab
- Track progress and manage your startup journey

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── login/route.ts
│   │   ├── ai/
│   │   │   ├── idea/route.ts
│   │   │   └── mvp/route.ts
│   │   └── projects/route.ts
│   ├── auth/
│   │   ├── signup/page.tsx
│   │   └── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
└── ...
```

## Database Schema

### User
- id (primary key)
- email (unique)
- hashedPassword
- createdAt
- updatedAt

### Project
- id (primary key)
- title
- description
- idea (AI-generated)
- mvpPlan (AI-generated)
- status
- userId (foreign key)
- createdAt
- updatedAt

### Task
- id (primary key)
- title
- description
- status
- priority
- dueDate
- userId (foreign key)
- projectId (foreign key)

## Development

### Adding New Features
1. Create API routes in `src/app/api/`
2. Add frontend components in `src/app/`
3. Update database schema in `prisma/schema.prisma`
4. Run `npx prisma migrate dev` for schema changes

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - see LICENSE file for details

## Support
For issues and questions, please open an issue on GitHub.
