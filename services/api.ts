import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private client;
  private storedToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.storedToken) {
          config.headers.Authorization = `Bearer ${this.storedToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear stored token on 401
          this.storedToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.storedToken = token;
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { token, user };
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, use mock login
        console.warn('Backend not available, using mock authentication');
        const mockToken = 'mock-jwt-token-for-demo';
        const mockUser = {
          id: '1',
          email: email,
          name: email === 'student@edukins.com' ? 'Alex Student' : 'Demo User'
        };
        this.setAuthToken(mockToken);
        return { token: mockToken, user: mockUser };
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      const response = await this.client.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { token, user };
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        // Backend not available, use mock registration
        console.warn('Backend not available, using mock registration');
        const mockToken = 'mock-jwt-token-for-demo';
        const mockUser = { id: '2', email, name };
        this.setAuthToken(mockToken);
        return { token: mockToken, user: mockUser };
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async getLessons() {
    try {
      const response = await this.client.get('/lesson');
      return response.data;
    } catch (error: any) {
      console.warn('Backend not available for lessons, using mock data');
      return this.getMockLessons();
    }
  }

  async getLesson(lessonId: string) {
    try {
      const response = await this.client.get(`/lesson/${lessonId}`);
      return response.data;
    } catch (error: any) {
      console.warn('Backend not available for lesson details, using mock data');
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
      throw new Error('Audio not available in demo mode');
    }
  }

  async getUserProfile() {
    try {
      const response = await this.client.get('/user/profile');
      return response.data;
    } catch (error: any) {
      console.warn('Backend not available for profile, using mock data');
      return this.getMockProfile();
    }
  }

  async updateUserProfile(data: { name?: string; email?: string }) {
    try {
      const response = await this.client.put('/user/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error('Profile update not available in demo mode');
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
      },
      '4': {
        id: '4',
        subject: 'History',
        grade: 5,
        topic: 'Ancient Civilizations',
        avatar: 'Time Traveler',
        script: `Welcome, young historians! I'm your Time Traveler guide, and today we're going on an incredible journey back in time to explore the fascinating world of ancient civilizations!

Thousands of years ago, before there were cars, computers, or even books as we know them today, amazing civilizations flourished around the world. These ancient peoples built incredible monuments, developed writing systems, and created societies that still influence us today.

Let's start our journey in ancient Egypt, along the mighty Nile River. The Egyptians built the incredible pyramids - massive stone structures that still stand today! They also created hieroglyphics, a writing system using pictures and symbols. The Egyptians were masters of medicine, mathematics, and engineering.

Next, let's travel to ancient Greece, where democracy was born! The Greeks gave us the Olympic Games, amazing stories about gods and heroes, and incredible architecture like the Parthenon. Great thinkers like Socrates, Plato, and Aristotle asked big questions about life and how we should live.

Our journey continues to ancient Rome, a mighty empire that stretched across much of Europe, Africa, and Asia. The Romans built incredible roads, aqueducts to carry water, and the famous Colosseum where gladiators fought. They also gave us our calendar and many of the laws we still use today.

Let's also visit ancient China, where paper, gunpowder, and the compass were invented. The Chinese built the Great Wall, a massive fortification that stretches for thousands of miles! They also gave us silk, tea, and beautiful art and poetry.

Finally, we'll explore the ancient civilizations of the Americas, like the Maya and the Aztecs. These peoples built incredible cities in the jungle, created accurate calendars, and developed advanced knowledge of astronomy and mathematics.

Each of these civilizations contributed something special to human history. They remind us that people have always been creative, curious, and capable of amazing achievements. Who knows? Maybe one day, future historians will look back at our time and marvel at what we accomplished!`,
        duration: '18 min',
        difficulty: 'Intermediate'
      },
      '5': {
        id: '5',
        subject: 'Geography',
        grade: 4,
        topic: 'World Continents',
        avatar: 'Explorer Guide',
        script: `Hello, young explorers! I'm your Explorer Guide, and today we're going on an amazing adventure around our beautiful planet Earth to discover the seven continents!

Our Earth is like a giant puzzle made up of seven huge pieces of land called continents. Each continent is unique, with its own countries, people, animals, and amazing features.

Let's start our journey in North America, where we find countries like the United States, Canada, and Mexico. This continent has everything from frozen tundra in the north to tropical beaches in the south. It's home to the Grand Canyon, Niagara Falls, and the Rocky Mountains!

Next, we'll explore South America, a continent shaped like a triangle! Here you'll find the Amazon rainforest - the largest rainforest in the world - and the mighty Amazon River. The Andes Mountains stretch along the western coast, and countries like Brazil, Argentina, and Peru call this continent home.

Now let's cross the Atlantic Ocean to Europe, a continent packed with history and culture. Though it's one of the smaller continents, Europe has many countries like France, Germany, Italy, and the United Kingdom. You'll find ancient castles, beautiful art, and delicious food everywhere you go!

Our adventure continues to Africa, the second-largest continent. Africa is home to incredible wildlife like lions, elephants, and giraffes. The Sahara Desert covers much of northern Africa, while tropical rainforests grow in the center. The Nile River, the longest river in the world, flows through this amazing continent.

Next, we'll visit Asia, the largest continent of all! Asia is home to more than half of all the people on Earth. Here you'll find the highest mountain (Mount Everest), the largest country (Russia), and the most populated countries (China and India). Asia has deserts, jungles, frozen lands, and bustling cities.

Let's journey to Australia, the smallest continent, which is also a country! Australia is famous for unique animals like kangaroos, koalas, and the platypus. Much of Australia is desert, called the Outback, but it also has beautiful beaches and the Great Barrier Reef.

Finally, we'll visit Antarctica, the coldest and windiest continent at the bottom of our planet. It's covered in ice and snow all year round! No people live there permanently, but scientists visit to study this frozen wilderness. Penguins, seals, and whales call Antarctica home.

Remember, each continent is special and important. Together, they make up our wonderful world, and each one has something amazing to offer. Keep exploring, young adventurers!`,
        duration: '14 min',
        difficulty: 'Beginner'
      },
      '6': {
        id: '6',
        subject: 'Science',
        grade: 6,
        topic: 'Chemical Reactions',
        avatar: 'Lab Assistant',
        script: `Welcome to the exciting world of chemistry! I'm your Lab Assistant, and today we're going to explore the fascinating world of chemical reactions - the amazing transformations that happen all around us every day!

A chemical reaction occurs when two or more substances combine to form something completely new. It's like a recipe in cooking, but instead of making food, we're making new chemicals! The substances we start with are called reactants, and what we end up with are called products.

Chemical reactions are happening everywhere around you right now! When you breathe, your body uses oxygen to create energy - that's a chemical reaction. When you cook an egg, the heat causes the proteins to change - another chemical reaction. Even when iron rusts or a candle burns, chemical reactions are taking place.

Let's talk about the signs that tell us a chemical reaction is happening. First, you might see a color change - like when a green copper penny turns brown, or when leaves change color in the fall. Second, you might notice bubbles forming, like when you mix baking soda and vinegar. Third, the temperature might change - some reactions make things hot, while others make them cold.

You might also smell something new, see light being produced (like in fireworks), or notice that a solid forms when you mix two liquids together. These are all clues that atoms are rearranging themselves to form new substances!

Here's something amazing: in every chemical reaction, atoms are never created or destroyed - they just rearrange themselves into new combinations. This is called the Law of Conservation of Mass. It's like having a box of LEGO blocks - you can build different things, but you always have the same number of blocks.

Let's explore some fun chemical reactions you can observe safely. When you mix baking soda (sodium bicarbonate) with vinegar (acetic acid), you get carbon dioxide gas, water, and sodium acetate. The bubbling you see is the carbon dioxide gas escaping!

Another cool reaction happens when you mix hydrogen peroxide with yeast. The yeast acts as a catalyst - it speeds up the reaction that breaks down hydrogen peroxide into water and oxygen gas. You'll see lots of bubbles as the oxygen escapes!

Chemical reactions are also essential for life. Photosynthesis is a chemical reaction where plants use sunlight, carbon dioxide, and water to make glucose (sugar) and oxygen. This reaction is why we have oxygen to breathe and food to eat!

In your body, digestion involves many chemical reactions that break down food into nutrients your body can use. Even thinking involves chemical reactions in your brain!

Scientists use chemical equations to describe reactions, kind of like mathematical equations. For example, when hydrogen gas reacts with oxygen gas to make water, we write: 2H₂ + O₂ → 2H₂O. This tells us exactly what's happening at the atomic level.

Remember, chemistry is all about understanding how matter changes and transforms. Every chemical reaction follows the same basic rules, whether it's happening in a laboratory, in your kitchen, or inside your own body. Keep observing the world around you - you'll be amazed at how many chemical reactions you can spot!`,
        duration: '22 min',
        difficulty: 'Advanced'
      }
    };

    return lessons[lessonId] || lessons['1'];
  }

  private getMockProfile() {
    return {
      id: '1',
      email: 'student@edukins.com',
      name: 'Alex Student',
      grade: 5,
      completedLessons: ['1', '2'],
      totalLessons: 12,
      subjects: ['Science', 'Math', 'English', 'History', 'Geography']
    };
  }
}

export const apiService = new ApiService();