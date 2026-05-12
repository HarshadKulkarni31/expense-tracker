import { showToast } from './components/toast.js';

// 20 Predefined FAQs related to SpendWise
const faqs = [
  { match: /add.*expense/i, answer: "Navigate to the Expenses tab and click the Add Expense button." },
  { match: /(total spending|how much.*spent)/i, answer: "Your total spending is available right on the Dashboard." },
  { match: /recent transactions/i, answer: "You can view your recent transactions in the Expenses tab." },
  { match: /set.*budget/i, answer: "Yes! Go to the Budget tab to set your monthly category limits." },
  { match: /(what tabs|available features)/i, answer: "The app includes Dashboard, Expenses, Calendar, Analytics, Budget, and Recurring bills." },
  { match: /delete.*expense/i, answer: "Go to the Expenses tab, find the item in the list, and click the delete icon." },
  { match: /recurring bills/i, answer: "Navigate to the Recurring tab to add or manage your subscription bills." },
  { match: /data saved/i, answer: "Yes, all your entries are saved securely in the cloud." },
  { match: /categorize.*expense/i, answer: "You can select a category from the dropdown menu when adding a new expense." },
  { match: /(spending.*chart|charts)/i, answer: "Yes, the Analytics tab features beautiful charts for visual analysis of your spending." },
  { match: /expenses.*calendar/i, answer: "Go to the Calendar tab to see your expenses organized by date." },
  { match: /export.*data/i, answer: "Yes, use the Export CSV option in the sidebar footer to download your data." },
  { match: /exceed.*budget/i, answer: "The budget progress bar will turn red to alert you of overspending." },
  { match: /log out/i, answer: "Click the Sign Out button at the bottom of the sidebar." },
  { match: /share.*family/i, answer: "You can share your Family Code found in the sidebar so others can join your workspace." },
  { match: /where.*voice assistant/i, answer: "I'm right here in the bottom right, always ready to help!" },
  { match: /offline/i, answer: "The app relies on cloud storage, so you need an internet connection to sync data." },
  { match: /reset.*data/i, answer: "You can click the Reset Data button in the sidebar to clear all family data." },
  { match: /change.*theme/i, answer: "Use the toggle switch in the top right corner to switch between light and dark modes." },
  { match: /(who created|who made)/i, answer: "This Expense Tracker was designed to help you and your family master your finances." }
];

const tabMappings = {
  "dashboard": "dashboard",
  "expenses": "expenses",
  "calendar": "calendar",
  "analytics": "analytics",
  "budget": "budget",
  "recurring": "recurring"
};

export function initVoiceAssistant() {
  const btn = document.getElementById('voice-assistant-fab');
  if (!btn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btn.style.display = 'none';
    console.warn("Speech Recognition API not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let isListening = false;

  btn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch(e) {
        console.error(e);
      }
    }
  });

  recognition.onstart = () => {
    isListening = true;
    btn.classList.add('is-listening');
    showToast('Listening...', 'info');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    handleVoiceCommand(transcript);
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    isListening = false;
    btn.classList.remove('is-listening');
  };

  recognition.onerror = (event) => {
    isListening = false;
    btn.classList.remove('is-listening');
    if (event.error !== 'no-speech') {
      showToast('Voice error: ' + event.error, 'error');
    }
  };
}

function handleVoiceCommand(transcript) {
  // 1. Check for tab navigation
  let navigated = false;
  for (const [key, value] of Object.entries(tabMappings)) {
    if (transcript.includes(key) || transcript.includes('go to ' + key) || transcript.includes('open ' + key) || transcript.includes('show ' + key)) {
      window.location.hash = '#' + value;
      speak("Navigating to " + key);
      showToast("Navigated to " + key, 'success');
      navigated = true;
      break;
    }
  }

  if (navigated) return;

  // 2. Check for FAQs
  for (const faq of faqs) {
    if (faq.match.test(transcript)) {
      speak(faq.answer);
      showToast("Assistant: " + faq.answer, 'info');
      return;
    }
  }

  // 3. Fallback
  speak("I'm sorry, I didn't understand that.");
  showToast("Did not recognize command: " + transcript, 'warning');
}

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}
