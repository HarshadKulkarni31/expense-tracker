# SpendWise - Family Expense Tracker

A shared expense tracking application for families. Members sign in from their own devices, join the same family with an invite code, and see only that family's expenses.

## Features

- **Firebase Authentication**: Email/password accounts for each family member
- **Private Families**: Each household has its own invite code and shared expense data
- **Security Hardening**: Strict Content Security Policy (CSP) and XSS prevention across all views
- **Dashboard**: Overview of monthly spending, daily average, budget usage, and recent expenses
- **Expenses**: Add, edit, search, filter, and export family expenses
- **Added By Tracking**: Expenses record which family member added them
- **Calendar**: Daily spending view for the selected month
- **Analytics**: Category, distribution, daily trend, and top spending day charts
- **Budget**: Overall and category budget tracking
- **Recurring**: Manage subscriptions and recurring bills
- **AI Voice Assistant**: Navigate tabs and ask FAQs hands-free using voice commands (Web Speech API)
- **Theme Toggle**: Premium animated dark/light mode toggle switch
- **Easy Sharing**: One-click clipboard copy for the family invite code

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES modules
- **Charts**: Chart.js
- **Backend**: Firebase Authentication and Firestore
- **Storage Model**: `households/{householdId}/data/main`

## Firebase Setup

1. Create a Firebase project.
2. Enable **Authentication > Email/Password**.
3. Enable **Firestore Database**.
4. Put your Firebase web config in `js/firebase.js`.
5. Publish the rules from `firestore.rules` to Firestore Rules.

Families are separated by Firestore rules. Do not rely only on front-end filtering for privacy.

## How to Run

Because the app uses ES modules and remote Firebase imports, run it from a local server:

```bash
python -m http.server 4173
```

Then open:

```txt
http://127.0.0.1:4173/
```

## How Families Use It

1. One person creates an account.
2. They create a family workspace.
3. SpendWise shows an invite code in the sidebar.
4. Other family members create/sign in to their own accounts.
5. They choose **Join a family** and enter that invite code.

Everyone in the same family sees the same expenses. Users outside that family cannot read or write those household documents when the provided Firestore rules are deployed.

## Project Structure

```txt
expense-tracker/
|-- index.html
|-- firestore.rules
|-- assets/
|-- css/
|   |-- auth.css
|   |-- design-system.css
|   |-- layout.css
|   |-- components.css
|   |-- dashboard.css
|   |-- expenses.css
|   |-- calendar.css
|   |-- analytics.css
|   |-- budget.css
|   `-- recurring.css
`-- js/
    |-- app.js
    |-- auth.js
    |-- router.js
    |-- store.js
    |-- firebase.js
    |-- voice.js
    |-- charts.js
    |-- utils.js
    |-- demo-data.js
    |-- components/
    `-- views/
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

*Note: The AI Voice Assistant requires the Web Speech API, which is fully supported on modern Chrome and Edge browsers. Firefox and Safari support may vary depending on settings.*
