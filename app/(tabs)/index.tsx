import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  Linking,
  Dimensions,
  FlatList,
  Animated
} from 'react-native';

// Types
interface User {
  email: string;
  name: string;
  type: 'student' | 'parent';
}

type Page = 'home' | 'learn' | 'quizzes' | 'quiz' | 'games' | 'progress' | 'parent' | 'help';
type QuizSubject = 'math' | 'english' | 'science' | 'history' | 'geography' | 'art';
type GradeLevel = '1-5' | '6-8' | '9-12';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface QuizData {
  [key: string]: Quiz;
}

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  ageRange: string;
}

// Color Palette
const Colors = {
  primary: '#4A6FA5',
  secondary: '#6B8E23',
  accent: '#FF6B6B',
  light: '#F8F9FA',
  dark: '#2D3748',
  lighter: '#E8F4F8',
  success: '#48BB78',
  warning: '#ED8936',
  error: '#E53E3E',
  grade1: '#A8D5BA',
  grade6: '#85C7F2',
  grade9: '#D4A5A5',
  aiBubble: '#EBF8FF',
  footerBg: '#2D3748',
  footerText: '#CBD5E0',
  footerAccent: '#4A6FA5',
  white: '#FFFFFF',
  gray100: '#F7FAFC',
  gray200: '#EDF2F7',
  gray300: '#E2E8F0',
  gray400: '#CBD5E0',
  gray500: '#A0AEC0',
  gray600: '#718096',
  gray700: '#4A5568',
  gray800: '#2D3748',
  gray900: '#1A202C',
};

// Demo users data
const demoUsers = {
  'student@demo.com': {
    password: '123456',
    name: 'Alex Johnson',
    type: 'student' as const
  },
  'parent@demo.com': {
    password: '123456',
    name: 'Sarah Johnson',
    type: 'parent' as const
  }
};

// Quiz data
const quizData: QuizData = {
  math: {
    title: "Mathematics",
    questions: [
      {
        question: "What is 15 + 27?",
        options: ["32", "42", "52", "62"],
        correctAnswer: 1
      },
      {
        question: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1
      }
    ]
  },
  english: {
    title: "English",
    questions: [
      {
        question: "Which word is a noun?",
        options: ["run", "beautiful", "book", "quickly"],
        correctAnswer: 2
      }
    ]
  },
  science: {
    title: "Science",
    questions: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
      }
    ]
  }
};

// Games data
const gamesData: Game[] = [
  {
    id: '1',
    title: 'Math Adventure',
    description: 'Solve math problems to advance through levels.',
    category: 'Mathematics',
    url: 'https://www.coolmathgames.com/',
    ageRange: '6-12'
  },
  {
    id: '2',
    title: 'Word Quest',
    description: 'Build vocabulary and spelling skills.',
    category: 'English',
    url: 'https://www.funbrain.com/games/word-games',
    ageRange: '8-14'
  }
];

// Grade-specific content
const gradeContent = {
  '1-5': {
    title: 'Grades 1-5 Learning Materials',
    subjects: [
      {
        name: 'Mathematics',
        topics: ['Basic Addition & Subtraction', 'Shapes & Patterns', 'Counting Money']
      },
      {
        name: 'English',
        topics: ['Phonics', 'Basic Reading', 'Simple Sentences']
      }
    ],
    description: 'Fun and interactive learning materials for elementary school.'
  },
  '6-8': {
    title: 'Grades 6-8 Learning Materials',
    subjects: [
      {
        name: 'Mathematics',
        topics: ['Algebra Basics', 'Geometry', 'Fractions & Decimals']
      },
      {
        name: 'English',
        topics: ['Grammar & Punctuation', 'Reading Comprehension', 'Essay Writing']
      }
    ],
    description: 'Engaging educational content for middle school students.'
  },
  '9-12': {
    title: 'Grades 9-12 Learning Materials',
    subjects: [
      {
        name: 'Mathematics',
        topics: ['Advanced Algebra', 'Calculus', 'Trigonometry']
      },
      {
        name: 'English',
        topics: ['Advanced Literature', 'Creative Writing', 'Research Papers']
      }
    ],
    description: 'Comprehensive learning resources for high school students.'
  }
};

// Children Images placeholder data
const ChildrenImages = {
  grade1_5: ['📚', '🎒', '✏️'],
  grade6_8: ['📝', '🔬', '📖'],
  grade9_12: ['🎓', '📊', '🔍'],
  learning: ['📚', '🎯', '🌟'],
  games: ['🎮', '🧩', '🎲'],
  success: ['🏆', '⭐', '🎉']
};

// Footer Component
const Footer: React.FC<{
  onPageChange: (page: Page) => void;
}> = ({ onPageChange }) => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.footerColumn}>
          <Text style={styles.footerColumnTitle}>EduPlus</Text>
          <Text style={styles.footerDescription}>
            Providing free quality education to underprivileged children worldwide.
          </Text>
        </View>

        <View style={styles.footerColumn}>
          <Text style={styles.footerColumnTitle}>Quick Links</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => onPageChange('home')}>
              <Text style={styles.footerLink}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onPageChange('learn')}>
              <Text style={styles.footerLink}>Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onPageChange('games')}>
              <Text style={styles.footerLink}>Games</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerColumn}>
          <Text style={styles.footerColumnTitle}>Contact Us</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>help@eduplus.org</Text>
            <Text style={styles.contactText}>+27 (800) EDU-PLUS</Text>
          </View>
        </View>
      </View>

      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>
          &copy; 2025 EduPlus. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

// Image component for better image handling
const ChildImage: React.FC<{ source: string; style?: any }> = ({ source, style }) => (
  <View style={[styles.childImageContainer, style]}>
    <View style={styles.childImage}>
      <Text style={styles.childImagePlaceholder}>{source}</Text>
    </View>
  </View>
);

// AI Chat Component
const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { 
      text: "Hi there! 👋 I'm your AI tutor. How can I help you today?", 
      isUser: true 
    }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        text: "That's a great question! Let me help you with that.", 
        isUser: false
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.chatModal}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>🤖 EduPlus AI Tutor</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeChatText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.chatMessages}>
              {messages.map((message, index) => (
                <View key={index} style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything..."
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.chatToggle}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.chatToggleText}>🤖 AI Tutor</Text>
      </TouchableOpacity>
    </>
  );
};

// Auth Modal Component
const AuthModal: React.FC<{
  visible: boolean;
  initialTab: 'signin' | 'signup';
  onLogin: (user: User) => void;
  onClose: () => void;
}> = ({ visible, initialTab, onLogin, onClose }) => {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = () => {
    const user = demoUsers[formData.email as keyof typeof demoUsers];
    
    if (user && user.password === formData.password) {
      onLogin({
        email: formData.email,
        name: user.name,
        type: user.type
      });
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  const handleSignUp = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.userType) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    onLogin({
      email: formData.email,
      name: formData.name,
      type: formData.userType as 'student' | 'parent'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Welcome to EduPlus! 🎓</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, currentTab === 'signin' && styles.activeTab]}
              onPress={() => setCurrentTab('signin')}
            >
              <Text style={[styles.tabText, currentTab === 'signin' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, currentTab === 'signup' && styles.activeTab]}
              onPress={() => setCurrentTab('signup')}
            >
              <Text style={[styles.tabText, currentTab === 'signup' && styles.activeTabText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {currentTab === 'signin' && (
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="Enter your password"
                    secureTextEntry
                  />
                </View>
                
                <TouchableOpacity style={styles.submitButton} onPress={handleSignIn}>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {currentTab === 'signup' && (
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Enter your full name"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="Create a password"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>I am a:</Text>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity 
                      style={[styles.radio, formData.userType === 'student' && styles.radioSelected]}
                      onPress={() => handleInputChange('userType', 'student')}
                    >
                      <Text style={formData.userType === 'student' ? styles.radioTextSelected : styles.radioText}>
                        Student
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.radio, formData.userType === 'parent' && styles.radioSelected]}
                      onPress={() => handleInputChange('userType', 'parent')}
                    >
                      <Text style={formData.userType === 'parent' ? styles.radioTextSelected : styles.radioText}>
                        Parent/Guardian
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Header Component
const Header: React.FC<{
  currentUser: User | null;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLoginClick: (tab: 'signin' | 'signup') => void;
  onLogoutClick: () => void;
}> = ({ currentUser, currentPage, onPageChange, onLoginClick, onLogoutClick }) => {
  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'quizzes', label: 'Quizzes', icon: '🧠' },
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'progress', label: 'Progress', icon: '📊' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.navbar}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🎓</Text>
          <Text style={styles.logoText}>EduPlus</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navLinks}>
          {navItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navLink,
                currentPage === item.id && styles.navLinkActive
              ]}
              onPress={() => onPageChange(item.id)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[
                styles.navLinkText,
                currentPage === item.id && styles.navLinkTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.userActions}>
          {currentUser ? (
            <>
              <Text style={styles.userWelcome}>Hi, {currentUser.name.split(' ')[0]}</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={onLogoutClick}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.signInButton} 
                onPress={() => onLoginClick('signin')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signUpButton} 
                onPress={() => onLoginClick('signup')}
              >
                <Text style={styles.signUpButtonText}>Join</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

// Home Page Component
const HomePage: React.FC<{
  onStartLearning: () => void;
  onOpenAuth: (tab: 'signin' | 'signup') => void;
  currentUser: User | null;
  onGradeSelect: (grade: GradeLevel) => void;
}> = ({ onStartLearning, onOpenAuth, currentUser, onGradeSelect }) => {
  return (
    <ScrollView style={styles.page}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Learning Made Fun! 🎉</Text>
        <Text style={styles.heroSubtitle}>
          Join thousands of happy learners from Grades 1-12!
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={onStartLearning}>
          <Text style={styles.ctaText}>Start Learning Now</Text>
        </TouchableOpacity>
      </View>

      {!currentUser && (
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Ready to Learn? 🚀</Text>
          <Text style={styles.authSubtitle}>Join our community of learners</Text>
          <TouchableOpacity style={styles.authButton} onPress={() => onOpenAuth('signin')}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grade Selection */}
      <View style={styles.gradesSection}>
        <Text style={styles.sectionTitle}>Choose Your Grade Level</Text>
        
        <View style={styles.gradeGrid}>
          <TouchableOpacity style={[styles.gradeCard, styles.grade1]} onPress={() => onGradeSelect('1-5')}>
            <Text style={styles.gradeIcon}>👧</Text>
            <Text style={styles.gradeText}>Grades 1-5</Text>
            <Text style={styles.gradeSubtext}>Ages 6-11</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.gradeCard, styles.grade2]} onPress={() => onGradeSelect('6-8')}>
            <Text style={styles.gradeIcon}>👦</Text>
            <Text style={styles.gradeText}>Grades 6-8</Text>
            <Text style={styles.gradeSubtext}>Ages 12-14</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.gradeCard, styles.grade3]} onPress={() => onGradeSelect('9-12')}>
            <Text style={styles.gradeIcon}>🧑</Text>
            <Text style={styles.gradeText}>Grades 9-12</Text>
            <Text style={styles.gradeSubtext}>Ages 15-18</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Tutor Section */}
      <View style={styles.aiSection}>
        <Text style={styles.aiTitle}>AI Tutor Assistance</Text>
        <Text style={styles.aiSubtitle}>Get personalized help from our friendly AI tutor</Text>
      </View>
    </ScrollView>
  );
};

// Learn Page Component
const LearnPage: React.FC<{
  selectedGrade: GradeLevel | null;
  onGradeSelect: (grade: GradeLevel) => void;
}> = ({ selectedGrade, onGradeSelect }) => {
  if (!selectedGrade) {
    return (
      <ScrollView style={styles.page}>
        <View style={styles.gradesSection}>
          <Text style={styles.sectionTitle}>Select Your Grade Level</Text>
          <View style={styles.gradeGrid}>
            <TouchableOpacity style={[styles.gradeCard, styles.grade1]} onPress={() => onGradeSelect('1-5')}>
              <Text style={styles.gradeText}>Grades 1-5</Text>
              <Text style={styles.gradeSubtext}>Elementary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gradeCard, styles.grade2]} onPress={() => onGradeSelect('6-8')}>
              <Text style={styles.gradeText}>Grades 6-8</Text>
              <Text style={styles.gradeSubtext}>Middle School</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gradeCard, styles.grade3]} onPress={() => onGradeSelect('9-12')}>
              <Text style={styles.gradeText}>Grades 9-12</Text>
              <Text style={styles.gradeSubtext}>High School</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  const content = gradeContent[selectedGrade];

  return (
    <ScrollView style={styles.page}>
      <View style={styles.gradeHeader}>
        <Text style={styles.pageTitle}>{content.title}</Text>
        <Text style={styles.pageSubtitle}>{content.description}</Text>
      </View>
      
      <View style={styles.subjectsGrid}>
        {content.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectCard}>
            <Text style={styles.subjectTitle}>{subject.name}</Text>
            <View style={styles.topicsList}>
              {subject.topics.map((topic, idx) => (
                <Text key={idx} style={styles.topic}>• {topic}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.learnButton}>
              <Text style={styles.learnButtonText}>Start Learning</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Games Page Component
const GamesPage: React.FC = () => {
  const openGame = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Cannot open link'));
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>{item.title}</Text>
      <Text style={styles.gameCategory}>{item.category} • Ages {item.ageRange}</Text>
      <Text style={styles.gameDescription}>{item.description}</Text>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => openGame(item.url)}
      >
        <Text style={styles.playButtonText}>Play Now 🎮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.gamesHeader}>
        <Text style={styles.pageTitle}>Educational Games</Text>
        <Text style={styles.pageSubtitle}>Fun games that make learning exciting!</Text>
      </View>
      
      <FlatList
        data={gamesData}
        renderItem={renderGameItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.gamesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Quizzes Page Component
const QuizzesPage: React.FC<{
  onStartQuiz: (subject: QuizSubject) => void;
}> = ({ onStartQuiz }) => {
  return (
    <ScrollView style={styles.page}>
      <View style={styles.gamesHeader}>
        <Text style={styles.pageTitle}>Learning Quizzes</Text>
        <Text style={styles.pageSubtitle}>Test your knowledge and win rewards! 🏆</Text>
      </View>
      
      <View style={styles.contentSection}>
        <View style={styles.quizzesGrid}>
          {Object.entries(quizData).map(([subject, quiz]) => (
            <View key={subject} style={styles.quizCard}>
              <Text style={styles.quizTitle}>{quiz.title} Quiz</Text>
              <Text style={styles.quizDescription}>
                Test your knowledge with this {quiz.title.toLowerCase()} quiz!
              </Text>
              <TouchableOpacity 
                style={styles.quizButton}
                onPress={() => onStartQuiz(subject as QuizSubject)}
              >
                <Text style={styles.quizButtonText}>Start Quiz</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Progress Page Component
const ProgressPage: React.FC = () => {
  const subjects = [
    { name: 'Mathematics', progress: 75 },
    { name: 'Science', progress: 60 },
    { name: 'English', progress: 85 },
  ];

  return (
    <ScrollView style={styles.page}>
      <View style={styles.gamesHeader}>
        <Text style={styles.pageTitle}>Your Progress</Text>
        <Text style={styles.pageSubtitle}>See how much you've learned! 📈</Text>
      </View>
      
      <View style={styles.contentSection}>
        <View style={styles.progressGrid}>
          {subjects.map((subject, index) => (
            <View key={index} style={styles.progressCard}>
              <Text style={styles.progressSubject}>{subject.name}</Text>
              <Text style={styles.progressText}>Progress: {subject.progress}%</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${subject.progress}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// App Splash Screen Component
const AppSplashScreen: React.FC<{
  visible: boolean;
  onFinish: () => void;
}> = ({ visible, onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [textAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          })
        ]).start(() => {
          onFinish();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, onFinish]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.splashContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.splashContent}>
        <Animated.View 
          style={[
            styles.splashLogo,
            {
              opacity: textAnim,
              transform: [{
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.splashTitle,
            {
              opacity: textAnim,
            }
          ]}
        >
          Welcome to EduPlus!
        </Animated.Text>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Main App Component
const EduPlusApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check for saved user using AsyncStorage
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log('Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);

  const handleLogin = async (userData: User) => {
    setCurrentUser(userData);
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.log('Error saving user:', error);
    }
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.log('Error removing user:', error);
    }
    setCurrentPage('home');
    setSelectedGrade(null);
  };


  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setCurrentPage('learn');
  };

  const handleStartQuiz = (subject: QuizSubject) => {
    Alert.alert('Quiz Starting', `Starting ${subject} quiz!`);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            onStartLearning={() => setCurrentPage('learn')}
            onOpenAuth={openAuthModal}
            currentUser={currentUser}
            onGradeSelect={handleGradeSelect}
          />
        );
      case 'learn':
        return (
          <LearnPage 
            selectedGrade={selectedGrade}
            onGradeSelect={handleGradeSelect}
          />
        );
      case 'quizzes':
        return <QuizzesPage onStartQuiz={handleStartQuiz} />;
      case 'games':
        return <GamesPage />;
      case 'progress':
        return <ProgressPage />;
      default:
        return (
          <HomePage 
            onStartLearning={() => setCurrentPage('learn')}
            onOpenAuth={openAuthModal}
            currentUser={currentUser}
            onGradeSelect={handleGradeSelect}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <AppSplashScreen 
        visible={showSplash} 
        onFinish={handleSplashFinish} 
      />
      
      {!showSplash && (
        <>
          <Header 
            currentUser={currentUser}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLoginClick={openAuthModal}
            onLogoutClick={handleLogout}
          />

          <View style={styles.mainContent}>
            {renderPage()}
          </View>

          <Footer onPageChange={setCurrentPage} />

          <AIChat />

          <AuthModal
            visible={showAuthModal}
            initialTab={authTab}
            onLogin={handleLogin}
            onClose={() => setShowAuthModal(false)}
          />
        </>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  mainContent: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  contentSection: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: Colors.dark,
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.gray600,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  
  // Footer Styles
  footer: {
    backgroundColor: Colors.footerBg,
    paddingVertical: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  footerColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  footerColumnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  footerDescription: {
    color: Colors.footerText,
    fontSize: 14,
    lineHeight: 20,
  },
  footerLinks: {
    gap: 8,
  },
  footerLink: {
    color: Colors.footerText,
    fontSize: 14,
    marginBottom: 5,
  },
  contactInfo: {
    gap: 10,
  },
  contactText: {
    color: Colors.footerText,
    fontSize: 14,
  },
  copyright: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    paddingTop: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  copyrightText: {
    color: Colors.footerText,
    fontSize: 12,
  },
  
  // Header Styles
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  navLinks: {
    flex: 1,
    marginHorizontal: 10,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  navIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  navLinkText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  navLinkTextActive: {
    color: Colors.accent,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userWelcome: {
    color: Colors.white,
    marginRight: 10,
    fontSize: 14,
  },
  signInButton: {
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 20,
    marginRight: 8,
  },
  signInButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  signUpButton: {
    padding: 8,
    backgroundColor: Colors.accent,
    borderRadius: 20,
  },
  signUpButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  logoutButton: {
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Hero Section
  hero: {
    backgroundColor: Colors.primary,
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Auth Prompt
  authPrompt: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.dark,
  },
  authSubtitle: {
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: 25,
  },
  authButton: {
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Grade Selection
  gradesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.dark,
  },
  gradeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  gradeCard: {
    backgroundColor: Colors.white,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 150,
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  grade1: {
    backgroundColor: Colors.grade1,
  },
  grade2: {
    backgroundColor: Colors.grade6,
  },
  grade3: {
    backgroundColor: Colors.grade9,
  },
  gradeIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
  },
  gradeSubtext: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 5,
  },
  
  // AI Section
  aiSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    margin: 20,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 5,
  },
  aiSubtitle: {
    color: Colors.gray600,
    fontSize: 16,
  },
  
  // Learn Page Styles
  gradeHeader: {
    padding: 20,
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 16,
  },
  subjectsGrid: {
    padding: 20,
  },
  subjectCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  topicsList: {
    marginBottom: 20,
  },
  topic: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 8,
  },
  learnButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  learnButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Games Page
  gamesHeader: {
    padding: 20,
  },
  gamesList: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 5,
  },
  gameCategory: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 10,
  },
  gameDescription: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Child Image Styles
  childImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  childImagePlaceholder: {
    fontSize: 32,
  },
  
  // Quizzes Page
  quizzesGrid: {
    marginTop: 20,
  },
  quizCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 10,
  },
  quizDescription: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 15,
  },
  quizButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  quizButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Progress Page
  progressGrid: {
    marginTop: 20,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  progressSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray300,
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  
  // Auth Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontWeight: '600',
    color: Colors.gray600,
  },
  activeTabText: {
    color: Colors.primary,
  },
  modalBody: {
    padding: 25,
  },
  form: {
    // Form styles
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  radioContainer: {
    flexDirection: 'row',
  },
  radio: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 5,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  radioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    color: Colors.dark,
  },
  radioTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  
  // AI Chat Styles
  chatModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  chatHeader: {
    backgroundColor: Colors.primary,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  closeChatText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.gray100,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.aiBubble,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary,
  },
  messageText: {
    lineHeight: 20,
    color: Colors.dark,
  },
  chatInputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
    backgroundColor: Colors.white,
    flexDirection: 'row',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 25,
    padding: 12,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  chatToggle: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  chatToggleText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Splash Screen Styles
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  splashLogo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 60,
  },
  splashLogoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginBottom: 10,
    fontSize: 16,
  },
});

export default EduPlusApp;