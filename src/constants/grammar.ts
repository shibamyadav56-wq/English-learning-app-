export const GRAMMAR_TOPICS = [
  {
    id: 'nouns',
    title: 'Nouns (संज्ञा)',
    description: 'Naming words for people, places, and things.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'A noun is the name of a person, place, animal, thing, or idea.\n(संज्ञा किसी व्यक्ति, स्थान, जानवर, वस्तु या भाव के नाम को कहते हैं।)'
      },
      {
        heading: 'Examples (उदाहरण)',
        text: '• Person (व्यक्ति): Rahul, Teacher, Boy\n• Place (स्थान): Delhi, School, City\n• Thing (वस्तु): Book, Car, Table\n• Idea (भाव): Honesty (ईमानदारी), Happiness (खुशी)'
      },
      {
        heading: 'Types of Nouns (संज्ञा के प्रकार)',
        text: '1. Proper Noun (व्यक्तिवाचक): Specific names (e.g., Rahul, India).\n2. Common Noun (जातिवाचक): General names (e.g., boy, country).\n3. Abstract Noun (भाववाचक): Feelings or ideas (e.g., love, honesty).'
      }
    ],
    quiz: [
      { question: 'Identify the noun in this sentence: "Rahul is playing."', options: ['is', 'playing', 'Rahul', 'None'], answer: 'Rahul' },
      { question: '"Honesty" किस प्रकार का Noun है?', options: ['Proper Noun', 'Common Noun', 'Abstract Noun', 'Material Noun'], answer: 'Abstract Noun' },
      { question: 'Choose the common noun:', options: ['Delhi', 'City', 'Ganga', 'Ramesh'], answer: 'City' },
      { question: 'Identify the proper noun: "I live in Mumbai."', options: ['live', 'in', 'Mumbai', 'I'], answer: 'Mumbai' },
      { question: '"Water" किस प्रकार का Noun है?', options: ['Proper Noun', 'Material Noun', 'Abstract Noun', 'Collective Noun'], answer: 'Material Noun' },
      { question: 'Identify the noun: "The dog barks."', options: ['The', 'dog', 'barks', 'None'], answer: 'dog' },
      { question: '"Happiness" is a/an:', options: ['Common Noun', 'Proper Noun', 'Abstract Noun', 'Material Noun'], answer: 'Abstract Noun' },
      { question: 'Choose the proper noun:', options: ['River', 'Mountain', 'Ganga', 'City'], answer: 'Ganga' },
      { question: 'Identify the noun: "She bought a car."', options: ['She', 'bought', 'a', 'car'], answer: 'car' },
      { question: '"Team" is an example of:', options: ['Proper Noun', 'Collective Noun', 'Material Noun', 'Abstract Noun'], answer: 'Collective Noun' }
    ]
  },
  {
    id: 'pronouns',
    title: 'Pronouns (सर्वनाम)',
    description: 'Words used in place of nouns.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'A pronoun is a word used instead of a noun to avoid repetition.\n(संज्ञा के स्थान पर प्रयोग होने वाले शब्दों को सर्वनाम कहते हैं, ताकि एक ही नाम बार-बार न बोलना पड़े।)'
      },
      {
        heading: 'Common Pronouns (सामान्य सर्वनाम)',
        text: '• I (मैं), We (हम)\n• You (तुम / आप)\n• He (वह - लड़के के लिए), She (वह - लड़की के लिए)\n• It (यह - निर्जीव या जानवर के लिए), They (वे)'
      },
      {
        heading: 'Example Sentences (वाक्य प्रयोग)',
        text: '• Rahul is my friend. He is a good boy.\n(राहुल मेरा दोस्त है। वह एक अच्छा लड़का है। - यहाँ "He" Pronoun है)'
      }
    ],
    quiz: [
      { question: 'Identify the pronoun: "She is reading a book."', options: ['reading', 'book', 'She', 'is'], answer: 'She' },
      { question: 'लड़के के लिए "वह" बोलने के लिए किस Pronoun का प्रयोग होता है?', options: ['She', 'It', 'He', 'They'], answer: 'He' },
      { question: 'Replace the noun with a pronoun: "The dog is barking. ___ is angry."', options: ['He', 'She', 'It', 'They'], answer: 'It' },
      { question: '"हम" को English में क्या कहते हैं?', options: ['I', 'You', 'They', 'We'], answer: 'We' },
      { question: 'Identify the pronoun: "They are playing."', options: ['are', 'playing', 'They', 'None'], answer: 'They' },
      { question: '"I" का plural (बहुवचन) क्या होता है?', options: ['He', 'She', 'We', 'They'], answer: 'We' },
      { question: 'Choose the correct pronoun: "___ am a student."', options: ['He', 'She', 'I', 'You'], answer: 'I' },
      { question: '"You" का अर्थ क्या होता है?', options: ['मैं', 'तुम / आप', 'वह', 'हम'], answer: 'तुम / आप' },
      { question: 'Replace the noun: "Ria is singing. ___ sings well."', options: ['He', 'She', 'It', 'We'], answer: 'She' },
      { question: 'Identify the pronoun: "He gave me a pen."', options: ['gave', 'pen', 'He', 'a'], answer: 'He' }
    ]
  },
  {
    id: 'verbs',
    title: 'Verbs (क्रिया)',
    description: 'Action words or state of being.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'A verb is a word that shows an action, occurrence, or state of being.\n(जिन शब्दों से किसी काम के करने या होने का पता चलता है, उन्हें क्रिया कहते हैं।)'
      },
      {
        heading: 'Action Verbs (काम बताने वाले शब्द)',
        text: '• Play (खेलना)\n• Eat (खाना)\n• Run (दौड़ना)\n• Write (लिखना)'
      },
      {
        heading: 'Helping Verbs (सहायक क्रिया)',
        text: '• is, am, are (है, हूँ, हैं)\n• was, were (था, थे)\n• have, has, had (पास है / चुका है)'
      }
    ],
    quiz: [
      { question: 'Identify the verb: "They play football."', options: ['They', 'play', 'football', 'None'], answer: 'play' },
      { question: 'इनमें से कौन सा Helping Verb (सहायक क्रिया) है?', options: ['Run', 'Eat', 'Is', 'Dance'], answer: 'Is' },
      { question: 'Choose the correct verb: "I ___ a student."', options: ['is', 'are', 'am', 'was'], answer: 'am' },
      { question: 'Identify the action verb: "She writes a letter."', options: ['She', 'writes', 'a', 'letter'], answer: 'writes' },
      { question: '"दौड़ना" को English में क्या कहते हैं?', options: ['Walk', 'Jump', 'Run', 'Sleep'], answer: 'Run' },
      { question: 'Choose the correct helping verb: "They ___ playing."', options: ['is', 'am', 'are', 'was'], answer: 'are' },
      { question: 'Identify the verb: "He is sleeping."', options: ['He', 'is', 'sleeping', 'Both is & sleeping'], answer: 'Both is & sleeping' },
      { question: '"था/थे" के लिए कौन सा verb इस्तेमाल होता है?', options: ['is/am', 'has/have', 'was/were', 'will/shall'], answer: 'was/were' },
      { question: 'Identify the verb: "We eat apple."', options: ['We', 'eat', 'apple', 'None'], answer: 'eat' },
      { question: 'Choose the correct verb: "She ___ a car."', options: ['have', 'has', 'is', 'are'], answer: 'has' }
    ]
  },
  {
    id: 'tenses',
    title: 'Tenses (काल)',
    description: 'Shows the time of an action.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'Tense shows the time of an action or state of being.\n(काल से हमें यह पता चलता है कि कोई काम किस समय हुआ है - बीते हुए समय में, अभी, या आने वाले समय में।)'
      },
      {
        heading: '1. Present Tense (वर्तमान काल)',
        text: 'जो काम अभी हो रहा है या रोज़ होता है।\n• I play. (मैं खेलता हूँ।)\n• He is eating. (वह खा रहा है।)'
      },
      {
        heading: '2. Past Tense (भूतकाल)',
        text: 'जो काम हो चुका है (बीता हुआ समय)।\n• I played. (मैंने खेला।)\n• He was eating. (वह खा रहा था।)'
      },
      {
        heading: '3. Future Tense (भविष्य काल)',
        text: 'जो काम आने वाले समय में होगा।\n• I will play. (मैं खेलूँगा।)\n• He will eat. (वह खाएगा।)'
      }
    ],
    quiz: [
      { question: '"I will go to school." यह कौन सा Tense है?', options: ['Present Tense', 'Past Tense', 'Future Tense', 'None'], answer: 'Future Tense' },
      { question: 'Past Tense का वाक्य चुनें:', options: ['She is dancing.', 'She danced.', 'She will dance.', 'She dances.'], answer: 'She danced.' },
      { question: 'Present Continuous Tense में कौन सा Helping Verb लगता है?', options: ['was/were', 'will/shall', 'is/am/are', 'had'], answer: 'is/am/are' },
      { question: '"मैं खेलता हूँ" का English अनुवाद क्या है?', options: ['I played', 'I am playing', 'I play', 'I will play'], answer: 'I play' },
      { question: '"He was eating." यह कौन सा Tense है?', options: ['Present Tense', 'Past Tense', 'Future Tense', 'None'], answer: 'Past Tense' },
      { question: 'Future Tense का Helping Verb क्या है?', options: ['is/am/are', 'was/were', 'has/have', 'will/shall'], answer: 'will/shall' },
      { question: '"वह जा चुका है" किस Tense का उदाहरण है?', options: ['Present Continuous', 'Present Perfect', 'Past Simple', 'Future Simple'], answer: 'Present Perfect' },
      { question: 'Identify the tense: "They are running."', options: ['Present Simple', 'Present Continuous', 'Past Continuous', 'Future Continuous'], answer: 'Present Continuous' },
      { question: '"मैंने खाना खाया" का English अनुवाद क्या है?', options: ['I eat food', 'I am eating food', 'I ate food', 'I will eat food'], answer: 'I ate food' },
      { question: 'Identify the tense: "She will sing a song."', options: ['Present Tense', 'Past Tense', 'Future Tense', 'None'], answer: 'Future Tense' }
    ]
  },
  {
    id: 'modals',
    title: 'Modals (रूपात्मक क्रियाएँ)',
    description: 'Can, Could, Should, May, Must etc.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'Modals are special verbs used to express ability, permission, advice, or possibility.\n(Modals विशेष क्रियाएँ हैं जो क्षमता, अनुमति, सलाह या संभावना को दर्शाती हैं।)'
      },
      {
        heading: 'Important Modals (महत्वपूर्ण Modals)',
        text: '• Can (सकता है) - Ability (क्षमता): I can speak English. (मैं अंग्रेज़ी बोल सकता हूँ।)\n• Should (चाहिए) - Advice (सलाह): You should study. (तुम्हें पढ़ना चाहिए।)\n• May (सकता है) - Permission (अनुमति): May I come in? (क्या मैं अंदर आ सकता हूँ?)\n• Must (ज़रूर चाहिए) - Obligation (ज़रूरी काम): You must wear a helmet. (तुम्हें हेलमेट ज़रूर पहनना चाहिए।)'
      }
    ],
    quiz: [
      { question: 'क्षमता (Ability) दिखाने के लिए किस Modal का प्रयोग होता है?', options: ['Should', 'May', 'Can', 'Must'], answer: 'Can' },
      { question: 'सलाह (Advice) देने के लिए सही Modal चुनें: "You ___ sleep early."', options: ['can', 'should', 'may', 'would'], answer: 'should' },
      { question: '"क्या मैं अंदर आ सकता हूँ?" का सही अनुवाद क्या है?', options: ['Can I come in?', 'May I come in?', 'Should I come in?', 'Must I come in?'], answer: 'May I come in?' },
      { question: '"तुम्हें हेलमेट ज़रूर पहनना चाहिए।" में कौन सा Modal लगेगा?', options: ['Can', 'May', 'Must', 'Could'], answer: 'Must' },
      { question: 'Identify the modal: "I can swim."', options: ['I', 'can', 'swim', 'None'], answer: 'can' },
      { question: '"शायद आज बारिश हो सकती है।" के लिए सही Modal क्या है?', options: ['Must', 'Should', 'May/Might', 'Can'], answer: 'May/Might' },
      { question: 'Choose the correct modal: "___ God bless you!"', options: ['Can', 'Should', 'Must', 'May'], answer: 'May' },
      { question: '"Could" किसका Past form है?', options: ['Shall', 'Will', 'Can', 'May'], answer: 'Can' },
      { question: 'Identify the modal: "We must respect our elders."', options: ['We', 'must', 'respect', 'elders'], answer: 'must' },
      { question: 'Choose the correct modal: "I ___ speak three languages."', options: ['may', 'should', 'can', 'must'], answer: 'can' }
    ]
  },
  {
    id: 'prepositions',
    title: 'Prepositions (पूर्वसर्ग)',
    description: 'In, On, At, Under, etc.',
    notes: [
      {
        heading: 'Definition (परिभाषा)',
        text: 'A preposition shows the relationship of a noun/pronoun to another word in the sentence (usually showing position or time).\n(Preposition वह शब्द है जो संज्ञा या सर्वनाम का संबंध वाक्य के अन्य शब्दों से बताता है, जैसे स्थान या समय।)'
      },
      {
        heading: 'Common Prepositions (सामान्य Prepositions)',
        text: '• In (में / अंदर): The book is in the bag. (किताब बैग में है।)\n• On (पर / ऊपर): The pen is on the table. (पेन टेबल पर है।)\n• Under (नीचे): The cat is under the chair. (बिल्ली कुर्सी के नीचे है।)\n• At (पर / निश्चित समय या स्थान): I will meet you at 5 PM. (मैं तुमसे 5 बजे मिलूँगा।)'
      }
    ],
    quiz: [
      { question: 'Choose the correct preposition: "The clock is ___ the wall."', options: ['in', 'on', 'under', 'at'], answer: 'on' },
      { question: '"बिल्ली टेबल के नीचे है।" - सही Preposition क्या होगा?', options: ['On', 'In', 'Under', 'Above'], answer: 'Under' },
      { question: 'समय (Time) बताने के लिए (जैसे 5 बजे) कौन सा Preposition लगता है?', options: ['In', 'On', 'At', 'By'], answer: 'At' },
      { question: '"The book is ___ the bag."', options: ['on', 'in', 'at', 'over'], answer: 'in' },
      { question: '"He is standing ___ the door."', options: ['in', 'on', 'at', 'under'], answer: 'at' },
      { question: '"The bird is flying ___ the tree."', options: ['under', 'in', 'over', 'at'], answer: 'over' },
      { question: '"I will meet you ___ Monday."', options: ['in', 'at', 'on', 'by'], answer: 'on' },
      { question: 'Identify the preposition: "She is hiding behind the curtain."', options: ['She', 'hiding', 'behind', 'curtain'], answer: 'behind' },
      { question: '"The pen is ___ the table."', options: ['in', 'on', 'under', 'at'], answer: 'on' },
      { question: '"He jumped ___ the river."', options: ['in', 'on', 'into', 'at'], answer: 'into' }
    ]
  }
];
