import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getLessons() {
    try {
      const response = await this.client.get('/lessons');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }
      // Return mock data for demo
      return this.getMockLessons();
    }
  }

  async getLesson(lessonId: string) {
    try {
      const response = await this.client.get(`/lesson/${lessonId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }
      // Return mock data for demo
      return this.getMockLesson(lessonId);
    }
  }

  async getLessonAudio(lessonId: string) {
    try {
      const response = await this.client.get(`/lesson/${lessonId}/audio`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`Failed to fetch audio: ${error.message}`);
    }
  }

  // Mock data for demo purposes
  private getMockLessons() {
    return [
      {
        id: '1',
        subject: 'Science',
        grade: 5,
        topic: 'The Solar System',
        avatar: 'Professor Nova',
        duration: '15 min',
        difficulty: 'Intermediate'
      },
      {
        id: '2',
        subject: 'Math',
        grade: 4,
        topic: 'Fractions and Decimals',
        avatar: 'Math Wizard',
        duration: '12 min',
        difficulty: 'Beginner'
      },
      {
        id: '3',
        subject: 'English',
        grade: 6,
        topic: 'Creative Writing',
        avatar: 'Story Teller',
        duration: '20 min',
        difficulty: 'Advanced'
      },
      {
        id: '4',
        subject: 'History',
        grade: 5,
        topic: 'Ancient Civilizations',
        avatar: 'Time Traveler',
        duration: '18 min',
        difficulty: 'Intermediate'
      },
      {
        id: '5',
        subject: 'Geography',
        grade: 4,
        topic: 'World Continents',
        avatar: 'Explorer Guide',
        duration: '14 min',
        difficulty: 'Beginner'
      },
      {
        id: '6',
        subject: 'Science',
        grade: 6,
        topic: 'Chemical Reactions',
        avatar: 'Lab Assistant',
        duration: '22 min',
        difficulty: 'Advanced'
      }
    ];
  }

  private getMockLesson(lessonId: string) {
    const lessons: Record<string, any> = {
      '1': {
        id: '1',
        subject: 'Science',
        grade: 5,
        topic: 'The Solar System',
        avatar: 'Professor Nova',
        script: `Welcome to our exciting journey through the Solar System! I'm Professor Nova, and today we'll explore the amazing celestial bodies that make up our cosmic neighborhood.

Our Solar System consists of the Sun and everything that orbits around it. At the center, we have our magnificent Sun - a massive star that provides light and heat to all the planets.

Let's start with the planets closest to the Sun. Mercury is the smallest planet and the closest to the Sun. It's so hot during the day that it could melt lead! Venus comes next, often called Earth's twin because of its similar size, but it's covered in thick, poisonous clouds.

Then we have our beautiful home planet, Earth - the only planet we know of that supports life. Earth has liquid water, breathable air, and the perfect distance from the Sun to maintain comfortable temperatures.

Mars, the red planet, is next. It gets its red color from iron oxide, or rust, on its surface. Scientists are very interested in Mars because they think it might have had water in the past.

Beyond Mars, we find the gas giants. Jupiter is the largest planet in our Solar System - so big that all the other planets could fit inside it! It has a famous red spot, which is actually a giant storm that has been raging for hundreds of years.

Saturn is known for its beautiful rings made of ice and rock particles. These rings are so wide that they could stretch from Earth to the Moon!

Uranus is unique because it spins on its side, and Neptune is the windiest planet with storms reaching speeds of up to 1,200 miles per hour!

Our Solar System is truly amazing, and there's still so much more to discover. Remember, we're all space travelers on our planet Earth, zooming through the cosmos at incredible speeds!`,
        duration: '15 min',
        difficulty: 'Intermediate'
      },
      '2': {
        id: '2',
        subject: 'Math',
        grade: 4,
        topic: 'Fractions and Decimals',
        avatar: 'Math Wizard',
        script: `Hello young mathematicians! I'm the Math Wizard, and today we're going to unlock the magical world of fractions and decimals!

Think of fractions as pieces of a pizza. When you have a whole pizza and cut it into equal slices, each slice represents a fraction of the whole pizza. If you cut the pizza into 4 equal slices and take 1 slice, you have 1/4 of the pizza.

The number on top (1) is called the numerator - it tells us how many pieces we have. The number on the bottom (4) is called the denominator - it tells us how many equal pieces the whole thing was divided into.

Let's practice with some examples. If you have 3 out of 8 slices of pizza, you have 3/8. If you eat 2 more slices, you now have 5/8 of the pizza.

Now, let's talk about decimals. Decimals are another way to show parts of a whole, but they use a decimal point. The decimal 0.5 means the same thing as the fraction 1/2 - it's half of something!

Here's the magic connection: 1/4 equals 0.25, 1/2 equals 0.5, and 3/4 equals 0.75. You can convert fractions to decimals by dividing the numerator by the denominator.

Let's try some fun examples. If you have $0.75, that's the same as having 3/4 of a dollar, or 75 cents. If you run 2.5 miles, that's the same as running 2 and 1/2 miles.

Remember, fractions and decimals are just different ways of expressing the same thing - parts of a whole. With practice, you'll become a fraction and decimal wizard too!`,
        duration: '12 min',
        difficulty: 'Beginner'
      },
      '3': {
        id: '3',
        subject: 'English',
        grade: 6,
        topic: 'Creative Writing',
        avatar: 'Story Teller',
        script: `Greetings, young storytellers! I'm your Story Teller, and today we're going to embark on an incredible adventure into the world of creative writing!

Every great story starts with an idea - a spark of imagination that grows into something amazing. Your ideas can come from anywhere: a dream you had, something interesting you saw, or even a "what if" question.

Let's talk about the building blocks of a great story. First, you need characters - the people, animals, or even magical creatures in your story. Make them interesting! Give them personalities, dreams, and maybe even some flaws that make them feel real.

Next, you need a setting - where and when your story takes place. Is it in a magical forest, a bustling city, or maybe even on a distant planet? The setting helps create the mood and atmosphere of your story.

Every good story needs conflict - a problem that your characters need to solve. Maybe your character is trying to find a lost treasure, save their town from a dragon, or simply make a new friend at school.

Here's a secret from professional writers: show, don't tell. Instead of saying "Sarah was scared," you could write "Sarah's hands trembled as she reached for the creaky door handle." This helps readers feel like they're right there in the story.

Use your five senses when you write. What do your characters see, hear, smell, taste, and feel? This makes your story come alive in the reader's mind.

Don't forget about dialogue - the words your characters speak. Good dialogue sounds natural and helps reveal what your characters are thinking and feeling.

Remember, the first draft is just the beginning. Real writers revise and edit their work to make it better. Don't be afraid to change things, add details, or try different approaches.

Most importantly, have fun with your writing! Let your imagination run wild, and don't worry about making it perfect. Every great writer started exactly where you are now.`,
        duration: '20 min',
        difficulty: 'Advanced'
      }
    };

    return lessons[lessonId] || lessons['1'];
  }
}

export const apiService = new ApiService();