# Week 1 Project: Car Rental System

## 🎯 Project Overview

**Timeline:** 1 Week  
**Tech Stack:**

- Frontend: Next.js 14
- Backend: NestJS
- Database: PostgreSQL + Prisma
- Docker for database

**Goal:** Build a simple car rental system to show your current full-stack skills. Focus on getting things working, not making them perfect.

---

## 📦 Task 1: Setup & Basic Database - System design + important to check folder structure

### What to build:

Get your development environment running with Docker, create a simple database, and set up both backend and frontend projects.

### Your database needs 3 tables:

1. **Users** - id, email, password, firstName, lastName, role
2. **Cars** - id, name, brand, pricePerDay, category, imageUrl, available
3. **Bookings** - id, userId, carId, pickupDate, returnDate, totalPrice, status

Connect them with foreign keys. Add 5 sample cars and 1 test user to your database.

### You need to:

- Create docker-compose.yml with PostgreSQL
- Initialize NestJS backend project
- Initialize Next.js frontend project
- Set up Prisma and create your schema
- Run migrations and seed some data

### Success:

Everything runs without errors. You can see your data in the database.

---

## 📦 Task 2: Display Cars

### What to build:

Create an API endpoint that returns all cars, and a frontend page that displays them.

### Backend:

- Make a GET endpoint: `/cars`
- It should return all cars from the database
- Enable CORS so frontend can call it
- Pagination
- CRUD operations (create, update, delete) - optional

### Frontend:

- Create a page at `/cars`
- Fetch cars from your backend API
- Display them in a grid with: image, name, price, category
- Make it look decent with Tailwind CSS

### You need to:

- Create a Cars module in NestJS
- Use Prisma to query the database
- Fetch data in Next.js and display it
- Handle loading states

### Success:

You can open the cars page and see all your cars listed.

---

## 📦 Task 3: Simple Login

### What to build:

Basic login functionality where users can log in and get a JWT token.

### Backend:

- Create POST `/auth/login` endpoint
- Check if email and password match a user in database
- Return a JWT token if correct
- Hash passwords with bcrypt

### Frontend:

- Create a login page with email and password fields
- Send credentials to backend
- Store the JWT token in localStorage
- Redirect to cars page after successful login

### You need to:

- Install JWT packages in NestJS
- Create Auth module
- Hash passwords (use bcrypt)
- Create a login form in Next.js
- Handle form submission

### Success:

You can log in with test user credentials and get redirected to the cars page.

---

## 📦 Task 4: Smart Booking System with Dynamic Pricing & Conflict Prevention - Critical thinking

### What to build:

A sophisticated booking system where prices change based on demand and booking patterns. You must prevent double bookings while implementing surge pricing logic.

### The Challenge:

This car rental system uses dynamic pricing. The price per day changes based on:

1. **Booking duration:** Longer bookings get discounts

   - 1-2 days: full price
   - 3-6 days: 10% discount
   - 7+ days: 20% discount

2. **Peak days:** Weekends (Friday, Saturday, Sunday) cost 30% more than weekdays

3. **Demand surge:** If the car has been booked more than 3 times in the last 30 days, add 15% surge fee to the total

**AND** you must prevent overlapping bookings with the same car.

### Backend Requirements:

Create POST `/bookings` endpoint that:

1. **Checks availability:**

   - Query existing bookings for that car
   - Detect if requested dates overlap with any existing booking
   - Return error if overlap detected

2. **Calculates dynamic price:**

   - Count how many days are weekdays vs weekend days
   - Apply weekend pricing (30% more) to weekend days
   - Apply duration discount based on total days
   - Check booking history (count bookings for this car in last 30 days)
   - If count > 3, apply 15% surge pricing to final total
   - Return itemized breakdown: base price, weekend charges, discount, surge fee, final total

3. **Creates booking:**
   - Save with calculated price
   - Store breakdown for transparency

### Frontend Requirements:

Create a booking page with:

- Date range picker (pickup and return dates)
- **Real-time price calculator** that shows:
  - Number of weekdays and weekend days selected
  - Base price calculation
  - Applied discounts
  - Surge pricing if applicable
  - Final total price
  - Update calculation as user changes dates
- "Check Availability" button that verifies dates before booking
- Submit booking button
- Show detailed price breakdown after successful booking

### The Complexity:

You need to solve THREE hard problems:

1. **Date Overlap Logic:** How do you check if two date ranges conflict?

2. **Weekend Day Counter:** How do you count which days between two dates are weekends? (Hint: you'll need to loop through each day)

3. **Dynamic Pricing Math:** How do you calculate the correct price when you have:
   - Different rates for weekdays vs weekends
   - Duration-based discounts
   - Surge pricing based on historical bookings

### Example Calculation:

```
Car base price: $100/day
Booking: Thursday to Tuesday (6 days total)
- Thursday, Monday, Tuesday = 3 weekdays = $100 × 3 = $300
- Friday, Saturday, Sunday = 3 weekend days = $100 × 1.3 × 3 = $390
- Subtotal = $690
- Duration discount (3-6 days) = 10% off = $690 × 0.9 = $621
- Car was booked 5 times in last 30 days (> 3), so surge = $621 × 1.15 = $714.15
- Final price: $714.15
```

### You need to figure out:

- How to detect date range overlaps
- How to iterate through dates and identify day of week
- How to structure the pricing calculation logic
- How to query booking history for surge calculation
- How to handle date math (days between dates, day of week)
- How to make frontend update price in real-time as dates change

### Success means:

- System correctly prevents double bookings
- Prices calculate accurately with all rules applied
- Weekend days count correctly
- Discounts and surge pricing apply properly
- User sees price update as they select different dates
- Booking saves with complete price breakdown

---

## 📋 What to Deliver

### By end of week:

1. **GitHub Repository** with:

   - Backend code (NestJS)
   - Frontend code (Next.js)
   - Docker Compose file
   - README with setup instructions

2. **Working Application** that can:

   - Show a list of cars
   - Let users log in
   - Create bookings with date selection
   - Calculate dynamic prices correctly
   - Prevent double bookings

3. **Database** with:
   - 3 tables properly connected
   - Sample data to test with

---

## 🎤 Presentation (30 Minutes)

### Show me:

1. **Your application running (10 min)**

   - Browse cars
   - Log in
   - Make a booking with price breakdown

2. **Your code (15 min)**

   - Database schema
   - How login works
   - How booking creation works
   - Date overlap detection logic
   - Weekend day counting logic
   - Dynamic pricing calculation

3. **Discussion (5 min)**
   - Challenges you faced
   - What was hardest
   - What you learned

### I'll ask:

- "How does your date overlap detection work?"
- "Show me how you count weekend vs weekday days"
- "Walk me through the dynamic pricing calculation"
- "What happens if someone tries to book already reserved dates?"

---

## 💡 Important Notes

### Keep it simple:

- No need for registration (just use login with seeded user)
- No need for admin features (just customer side)
- Simple and clean UI is enough
- Focus on functionality over design

### Focus on:

- Getting things to work
- Understanding what you write
- Solving the complex pricing logic
- Connecting frontend to backend
- Database relationships

### You can:

- Use Google and documentation freely
- Ask AI tools for help understanding concepts
- Use placeholder images for cars
- Keep UI minimal with basic Tailwind
- Break the complex task into smaller pieces

### Time estimate:

- Day 1: Setup everything (Task 1)
- Day 2: Display cars and login (Task 2-3)
- Day 3-4: Basic booking without pricing logic
- Day 5-6: Implement dynamic pricing & overlap detection
- Day 7: Testing, fixes, documentation

---

## 🎯 What I'm Looking For

I want to see if you can:

- Set up a full-stack project from scratch
- Create basic API endpoints
- Connect to a database
- Build simple frontend pages
- Make frontend talk to backend
- Handle authentication basics
- **Solve complex business logic problems**
- **Work with dates and time calculations**
- **Implement multi-layered pricing algorithms**
- Manage your time on a project

**This is not a test to pass or fail.** It's to see your current level so we can plan the next 3 months together. Do your best with what you know!

**Good luck! 🚀**
