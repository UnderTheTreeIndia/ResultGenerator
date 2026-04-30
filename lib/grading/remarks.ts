import type { GradeBand } from "./grade";

export interface RemarkTemplate {
  en: string;
  hi: string;
}

/**
 * Locked text per the plan's "Remarks Library" appendix.
 * 6 multi-line bilingual templates per grade band; tone focused on
 * improvement areas, study discipline, consistency, and perseverance.
 * F/D bands are supportive, never punitive.
 */
export const REMARKS: Record<GradeBand, RemarkTemplate[]> = {
  "A+": [
    {
      en: "Outstanding performance — the rare result of curiosity paired with disciplined effort. Continue to set the standard for your peers, and stay patient when a concept stretches you. The next chapter rewards humility and steady practice.",
      hi: "यह उत्कृष्ट प्रदर्शन जिज्ञासा और अनुशासित परिश्रम का दुर्लभ संगम है। अपने सहपाठियों के लिए मानक बने रहें, और कठिन विषयों के सामने धैर्य रखें। आने वाला अध्याय विनम्रता और निरंतर अभ्यास से ही सजेगा।",
    },
    {
      en: "Excellent results, won through sustained focus rather than chance. Hold on to the daily habits — short revisions, quiet reading, careful notes — that brought you here. Your discipline is itself a lesson for those around you.",
      hi: "यह श्रेष्ठ परिणाम संयोग से नहीं, निरंतर एकाग्रता से प्राप्त हुआ है। प्रतिदिन के छोटे अभ्यास, शांत अध्ययन और सुव्यवस्थित लेखन — इन्हीं आदतों को बनाए रखें। आपका अनुशासन स्वयं में एक पाठ है।",
    },
    {
      en: "A remarkable result built on steady habits and genuine curiosity. Stretch yourself this term — pick one subject you find challenging and explore it deeper. Mastery deepens when comfort gives way to effort.",
      hi: "यह असाधारण परिणाम स्थिर आदतों और सच्ची जिज्ञासा का फल है। इस सत्र में स्वयं को और आगे बढ़ाइए — किसी एक कठिन विषय को गहराई से समझिए। महारत वहीं गहराती है जहाँ आराम के स्थान पर परिश्रम आता है।",
    },
    {
      en: "Your grades speak of a consistency that quietly compounds over months. Keep the rhythm steady; do not let success make you skip a single day's work. The student who returns to basics every week is the one who keeps rising.",
      hi: "आपके अंक उस निरंतरता की कहानी कहते हैं जो महीनों में चुपचाप बड़ी होती है। इस लय को बनाए रखें; सफलता को एक दिन का परिश्रम भी न छीनने दें। जो विद्यार्थी हर सप्ताह मूल बातों पर लौटता है, वही आगे बढ़ता रहता है।",
    },
    {
      en: "Excellence reached through quiet perseverance — the most reliable kind. Now move from solo effort to thoughtful exchange: explain ideas to a classmate, ask deeper questions in class. Teaching others sharpens what you already know.",
      hi: "यह उत्कृष्टता शांत दृढ़ता से अर्जित हुई है — और यही सबसे विश्वसनीय परिश्रम है। अब अकेले अध्ययन से आगे बढ़कर सहपाठियों से विचार बाँटिए, कक्षा में गहरे प्रश्न पूछिए। दूसरों को समझाना आपके अपने ज्ञान को और तीक्ष्ण करता है।",
    },
    {
      en: "An exceptional result, yet the true test now is to remain teachable. Watch for areas where understanding is still shallow and revisit them without ego. Long careers in learning are built on closing small gaps before they grow large.",
      hi: "यह अद्भुत परिणाम है, परंतु अब असली परीक्षा है — सीखने की विनम्रता बनाए रखना। उन विषयों को पहचानिए जहाँ समझ अभी उथली है, और उन्हें बिना अहंकार के दोहराइए। बड़े विद्यार्थी छोटी कमियों को बड़ा होने से पहले ही दूर कर लेते हैं।",
    },
  ],
  A: [
    {
      en: "Strong performance grounded in regular study and clear thinking. Build slightly tougher targets next term — a few more practice problems, one more revision cycle. Excellence is reached one steady step at a time.",
      hi: "नियमित अध्ययन और स्पष्ट चिंतन से अर्जित यह सशक्त परिणाम सराहनीय है। अगले सत्र में थोड़े कठिन लक्ष्य रखिए — कुछ और अभ्यास प्रश्न, एक और पुनरावलोकन-चक्र। उत्कृष्टता एक-एक सधे हुए कदम से आती है।",
    },
    {
      en: "A very good result that shows your study habits are working. Add one focused hour each week to weaker areas, and the gap to top marks will close. Consistency, not intensity, is what carries students forward.",
      hi: "यह उत्तम परिणाम बताता है कि आपकी अध्ययन-आदतें सही दिशा में हैं। प्रत्येक सप्ताह एक केंद्रित घंटा कमज़ोर विषयों को दीजिए — शीर्ष अंकों की दूरी अपने आप घटेगी। तीव्रता नहीं, निरंतरता ही विद्यार्थी को आगे ले जाती है।",
    },
    {
      en: "An impressive showing — disciplined effort is clearly visible. Now refine the edges: revisit careless errors, write neater answers, plan time better in tests. These small habits move good students into the top tier.",
      hi: "यह प्रभावशाली प्रदर्शन है — अनुशासित परिश्रम स्पष्ट दिखाई देता है। अब बारीकियाँ निखारिए: छोटी भूलों पर ध्यान, स्वच्छ लेखन, परीक्षा में समय का बेहतर प्रबंधन। यही छोटे सुधार उत्तम विद्यार्थी को श्रेष्ठ बनाते हैं।",
    },
    {
      en: "Your effort is paying off, and the consistency shows. Keep your weekly revision schedule alive even on busy weeks — that single habit guards every grade you have earned. Slow steady study beats last-minute rushes every term.",
      hi: "आपका परिश्रम रंग ला रहा है और निरंतरता स्पष्ट है। व्यस्त सप्ताहों में भी अपनी साप्ताहिक पुनरावलोकन-दिनचर्या न तोड़िए — यही एक आदत आपके सभी अंकों की रक्षा करती है। धीमा-स्थिर अध्ययन हर सत्र में जल्दबाज़ी पर भारी पड़ता है।",
    },
    {
      en: "A solid result — you are clearly learning, not just memorising. Pick one subject where understanding feels shaky and rebuild it from first principles. The student who repairs gaps now is the one who soars next year.",
      hi: "यह सशक्त परिणाम बताता है कि आप रटते नहीं, समझते हैं। ऐसा कोई एक विषय चुनिए जिसमें नींव डगमगाती है, और उसे मूल सिद्धांतों से पुनः बनाइए। जो विद्यार्थी समय रहते अपनी कमियाँ सुधारता है, अगले वर्ष वही ऊँची उड़ान भरता है।",
    },
    {
      en: "Excellent application, especially in subjects you find genuinely interesting. Now extend that same energy to topics you usually avoid. Studying what feels easy is comfort; studying what feels hard is growth.",
      hi: "रुचिकर विषयों में आपका समर्पण उत्तम है। अब यही ऊर्जा उन विषयों पर भी लगाइए जिनसे आप दूरी रखते हैं। आसान विषय पढ़ना आराम है; कठिन विषय पढ़ना ही विकास है।",
    },
  ],
  "B+": [
    {
      en: "A pleasing result — your effort is real and visible. The next leap will come from consistency, not from last-minute revision. Build a fixed daily study slot and protect it like a class hour.",
      hi: "यह संतोषजनक परिणाम आपके सच्चे परिश्रम का प्रमाण है। अगली छलाँग अंतिम-समय की तैयारी से नहीं, निरंतरता से आएगी। प्रतिदिन का एक निश्चित अध्ययन-समय निर्धारित कीजिए और उसे कक्षा-घंटे की तरह सुरक्षित रखिए।",
    },
    {
      en: "Good work — you are above average and clearly capable of more. Identify the two subjects costing you marks and devote an extra revision session each week. Targeted practice closes the gap faster than general studying.",
      hi: "अच्छा प्रदर्शन — आप औसत से ऊपर हैं और निश्चित ही और बेहतर कर सकते हैं। अंक खोने वाले दो विषयों को पहचानिए और प्रत्येक सप्ताह एक अतिरिक्त पुनरावलोकन-सत्र दीजिए। केंद्रित अभ्यास सामान्य अध्ययन से कहीं तेज़ी से अंतर पाटता है।",
    },
    {
      en: "A respectable result, with clear room to grow. Watch where you lose marks — small spelling errors, untidy work, skipped sub-questions — and remove these one at a time. Discipline in small things makes large differences in marks.",
      hi: "यह मान्य परिणाम है, परंतु आगे बढ़ने का स्पष्ट अवसर भी है। अंक कहाँ कटते हैं — वर्तनी, अस्वच्छ लेखन, छूटे प्रश्न-भाग — इन्हें एक-एक कर दूर कीजिए। छोटी-छोटी बातों का अनुशासन अंकों में बड़ा अंतर लाता है।",
    },
    {
      en: "You are clearly learning, but your study rhythm is not yet steady. Pick three days in the week where revision is non-negotiable. Habit beats motivation; the calendar carries the student further than the mood.",
      hi: "आप सीख तो रहे हैं, परंतु आपकी अध्ययन-लय अभी सुदृढ़ नहीं है। सप्ताह में तीन दिन ऐसे चुनिए जब पुनरावलोकन अनिवार्य हो। आदत प्रेरणा से बड़ी होती है; मनोदशा से अधिक कैलेंडर विद्यार्थी को आगे ले जाता है।",
    },
    {
      en: "Your potential is greater than these marks suggest. Pair up with a serious classmate for weekly study, and explain answers aloud to each other. Speaking what you know exposes the gaps faster than rereading the textbook.",
      hi: "आपकी क्षमता इन अंकों से कहीं अधिक है। एक गंभीर सहपाठी के साथ साप्ताहिक अध्ययन कीजिए और एक-दूसरे को उत्तर मौखिक रूप से समझाइए। बोलकर समझाना पुनः पढ़ने की तुलना में कमियों को जल्दी उजागर करता है।",
    },
    {
      en: "A good base — perseverance from here decides the final result. Do not wait for the next exam to begin revising; start the day after marks are out. The students who climb fastest are the ones who never let a topic stay half-understood.",
      hi: "यह अच्छा आधार है — अब आगे का परिणाम दृढ़ता से तय होगा। अगली परीक्षा का इंतज़ार न कीजिए, परिणाम के अगले ही दिन से अभ्यास आरम्भ कीजिए। सबसे तेज़ी से प्रगति वही करते हैं जो किसी विषय को अधूरा नहीं छोड़ते।",
    },
  ],
  B: [
    {
      en: "A fair result that shows you are working, but the gains have not yet matched the effort. Look honestly at how you study — is it active practice or only re-reading? Solving problems aloud and writing answers from memory builds far stronger learning.",
      hi: "यह उचित परिणाम बताता है कि आप परिश्रम कर रहे हैं, परंतु प्रतिफल अभी परिश्रम के अनुरूप नहीं है। ईमानदारी से देखिए — क्या अध्ययन सक्रिय है या केवल पुनर्पठन? प्रश्न हल करना और स्मरण से उत्तर लिखना अधिक सशक्त सीख देता है।",
    },
    {
      en: "You have crossed an important line — but the next step needs sharper discipline. Set a fixed time each evening for study, free of phone and noise. The student who guards a quiet hour every day grows faster than one who studies in long uneven bursts.",
      hi: "आपने एक महत्वपूर्ण रेखा पार की है — परंतु अगला चरण कठोर अनुशासन माँगता है। प्रत्येक संध्या को अध्ययन का एक निश्चित समय रखिए, मोबाइल और शोर से मुक्त। एक शांत घंटा प्रतिदिन सुरक्षित रखने वाला विद्यार्थी असमान लंबे प्रयासों से कहीं तेज़ी से बढ़ता है।",
    },
    {
      en: "A modest but honest result. The path forward is not more hours, but better hours — focused study without distraction. Try the simple rule of one chapter, one summary, one problem set at the end of every week.",
      hi: "यह विनम्र परंतु सच्चा परिणाम है। आगे का मार्ग अधिक समय नहीं, बेहतर समय माँगता है — विकर्षण-रहित केंद्रित अध्ययन। एक सरल नियम अपनाइए: हर सप्ताह — एक अध्याय, एक सारांश, एक अभ्यास-सेट।",
    },
    {
      en: "There is genuine ability here that deserves more steady effort. Many of these marks slipped through silly errors, not lack of knowledge. Slow down in the exam, read each question twice, and verify your answers before you submit.",
      hi: "यहाँ वास्तविक प्रतिभा है जिसे और स्थिर परिश्रम की आवश्यकता है। कई अंक अज्ञान से नहीं, छोटी भूलों से कटे हैं। परीक्षा में धीमे चलिए, प्रत्येक प्रश्न दो बार पढ़िए, और उत्तर सौंपने से पहले पुनः जाँचिए।",
    },
    {
      en: "A workable result, but the gap to your real potential is wide. Pick the one subject where you are weakest and give it the first hour of study every day for a month. Targeted, daily attention is what truly turns weak subjects strong.",
      hi: "यह कार्य-योग्य परिणाम है, परंतु आपकी वास्तविक क्षमता से दूरी अब भी बड़ी है। जो विषय सबसे कमज़ोर है, उसे एक माह तक प्रतिदिन अध्ययन का पहला घंटा दीजिए। केंद्रित दैनिक ध्यान ही कमज़ोर विषय को सशक्त बनाता है।",
    },
    {
      en: "You are capable of more — and these marks know it too. Build a simple weekly plan and review it every Sunday. Small written goals, kept honestly, transform average students into excellent ones over a year.",
      hi: "आप इससे अधिक के योग्य हैं — और ये अंक भी यही कहते हैं। एक सरल साप्ताहिक योजना बनाइए और प्रत्येक रविवार उसका पुनरावलोकन कीजिए। ईमानदारी से निभाए गए छोटे लिखित लक्ष्य एक वर्ष में औसत विद्यार्थी को उत्कृष्ट बना देते हैं।",
    },
  ],
  C: [
    {
      en: "A passing result, but well below what you can achieve. The biggest improvement will come not from more books, but from removing distractions during study time. One steady, screen-free hour a day will change these marks within a term.",
      hi: "यह उत्तीर्ण परिणाम तो है, पर आपकी सामर्थ्य से बहुत नीचे है। सबसे बड़ा सुधार और अधिक पुस्तकों से नहीं, अध्ययन-काल में विकर्षण हटाने से आएगा। प्रतिदिन का एक स्थिर, स्क्रीन-रहित घंटा एक सत्र के भीतर इन अंकों को बदल देगा।",
    },
    {
      en: "There is room — and need — for serious improvement. Begin with the basics of each subject and rebuild before chasing chapters ahead. A weak foundation cannot carry advanced topics, no matter how hard you study them.",
      hi: "सुधार की पर्याप्त — और आवश्यक — जगह है। प्रत्येक विषय की मूल बातों से पुनः आरंभ कीजिए, आगे के अध्यायों की ओर बाद में बढ़िए। कमज़ोर नींव पर उन्नत विषयों का भार टिक नहीं सकता, चाहे आप कितना भी पढ़ें।",
    },
    {
      en: "A result that signals study habits need rebuilding. Make a written daily routine, however simple, and tick it off each night. The discipline of small visible progress is what slowly turns these grades upward.",
      hi: "यह परिणाम संकेत देता है कि अध्ययन-आदतें पुनः गढ़ने योग्य हैं। एक सरल दैनिक दिनचर्या लिखिए और प्रत्येक रात उसे जाँचिए। प्रतिदिन के छोटे, दृश्य परिश्रम का अनुशासन ही धीरे-धीरे इन अंकों को ऊपर ले जाता है।",
    },
    {
      en: "These marks are not who you are; they are where your habits stand today. Habits change with steady, unglamorous repetition — read aloud, write summaries, solve last year's papers. Show up daily, and the next report card will tell a different story.",
      hi: "ये अंक आपकी पहचान नहीं, आपकी आज की आदतों का चित्र हैं। आदतें स्थिर, साधारण अभ्यास से बदलती हैं — ज़ोर से पढ़िए, सारांश लिखिए, गत वर्ष के प्रश्न-पत्र हल कीजिए। प्रतिदिन उपस्थित रहिए, अगला परिणाम भिन्न कहानी सुनाएगा।",
    },
    {
      en: "A wake-up worth heeding. Speak to your teacher about which two topics need urgent attention, and work only on those for the next four weeks. Narrow focus, repeated daily, beats trying to fix everything at once.",
      hi: "यह जागृत होने का अवसर है। अपने शिक्षक से पूछिए कि कौन-से दो विषय तुरंत ध्यान चाहते हैं, और आगामी चार सप्ताह केवल उन्हीं पर कार्य कीजिए। संकुचित ध्यान, प्रतिदिन दोहराया गया, सब कुछ एक साथ ठीक करने की कोशिश से अधिक प्रभावी है।",
    },
    {
      en: "Perseverance is the lesson now — not panic. Many strong students have stood exactly where you stand and risen, simply by refusing to skip a day. Begin tonight; a single page studied honestly is worth more than a long evening lost to delay.",
      hi: "इस समय का पाठ दृढ़ता है — घबराहट नहीं। बहुत-से सफल विद्यार्थी ठीक यहीं खड़े होकर ऊपर उठे हैं, केवल इसलिए कि उन्होंने एक भी दिन व्यर्थ नहीं जाने दिया। आज रात से आरंभ कीजिए; ईमानदारी से पढ़ा गया एक पृष्ठ टालमटोल में बीती लंबी संध्या से अधिक मूल्यवान है।",
    },
  ],
  D: [
    {
      en: "A difficult result, but not the end of the story. Begin with one subject and one small daily promise — say, twenty minutes after dinner — and keep it without fail. Small kept promises rebuild a student's confidence faster than long ambitious plans that break.",
      hi: "यह कठिन परिणाम है, पर कहानी का अंत नहीं। एक विषय और एक छोटा दैनिक संकल्प चुनिए — जैसे रात्रि-भोजन के बाद बीस मिनट — और उसे बिना भूले निभाइए। छोटे निभाए गए संकल्प टूटी हुई बड़ी योजनाओं की तुलना में आत्मविश्वास तेज़ी से लौटाते हैं।",
    },
    {
      en: "Improvement starts the day you stop avoiding the subjects you fear. Sit with the difficult chapter — even ten minutes the first day, twenty the next. Courage to open the book is half the work; the other half is daily return.",
      hi: "सुधार उसी दिन आरंभ होता है जिस दिन आप डर के विषयों से बचना छोड़ देते हैं। कठिन अध्याय के साथ बैठिए — पहले दिन दस मिनट, अगले दिन बीस। पुस्तक खोलने का साहस आधा परिश्रम है; शेष आधा प्रतिदिन की वापसी है।",
    },
    {
      en: "These marks ask for honesty, not despair. Speak with your teacher and parents, agree on a simple plan, and follow it with patience. Students rise from here every year — not by miracle, but by steady, unglamorous daily work.",
      hi: "ये अंक निराशा नहीं, ईमानदारी माँगते हैं। शिक्षक और परिजनों से बात कीजिए, एक सरल योजना पर सहमत होइए, और उसे धैर्य से निभाइए। ऐसे स्थान से प्रत्येक वर्ष विद्यार्थी ऊपर उठते हैं — चमत्कार से नहीं, स्थिर दैनिक परिश्रम से।",
    },
    {
      en: "The setback is real, but so is your ability to recover. Replace one hour of screen time with one hour of revision starting tonight, and protect that swap for thirty days. Habits, not heroics, will rebuild these grades.",
      hi: "यह झटका वास्तविक है, परंतु उतनी ही वास्तविक है आपकी पुनः उठने की शक्ति। आज रात से एक घंटा स्क्रीन-समय के स्थान पर एक घंटा पुनरावलोकन रखिए, और तीस दिन तक इस अदला-बदली की रक्षा कीजिए। आदतें, चमत्कार नहीं, इन अंकों को पुनर्निर्मित करेंगी।",
    },
    {
      en: "Discipline, not despair, will turn this around. Pick the easiest two chapters in your weakest subject and master them first — early small wins build the courage to face the harder ones. Confidence is the by-product of completed work.",
      hi: "इस स्थिति को निराशा नहीं, अनुशासन बदलेगा। अपने सबसे कमज़ोर विषय के दो सरलतम अध्याय चुनिए और पहले उन्हें साधिए — आरंभ की छोटी विजय कठिन अध्यायों का सामना करने का साहस देती है। आत्मविश्वास पूर्ण किए गए कार्य का उपहार है।",
    },
    {
      en: "This is a moment for perseverance — kept private, kept steady. Do not promise miracles to anyone, including yourself; promise only the next study session. A long climb is made of single steps you can keep, not grand resolutions you cannot.",
      hi: "यह दृढ़ता का क्षण है — चुपचाप और स्थिर। किसी से, स्वयं से भी, चमत्कार का वचन न दीजिए; केवल अगले अध्ययन-सत्र का वचन दीजिए। लंबी चढ़ाई उन छोटे क़दमों से बनी है जिन्हें आप निभा सकें — उन भव्य संकल्पों से नहीं जिन्हें आप नहीं निभा सकते।",
    },
  ],
  F: [
    {
      en: "This result is hard to read, but it is also a starting point. Speak to your teacher this week and ask honestly what to do first, second, third. A clear small plan, followed daily, has rescued many students from exactly this place.",
      hi: "यह परिणाम पढ़ना कठिन है, पर यही नई शुरुआत भी है। इसी सप्ताह अपने शिक्षक से ईमानदारी से पूछिए कि पहले, दूसरे और तीसरे चरण में क्या करना है। एक स्पष्ट छोटी योजना, प्रतिदिन निभाई जाए, तो अनेक विद्यार्थियों को ठीक इसी स्थान से ऊपर उठाया है।",
    },
    {
      en: "A serious setback, but you are still very much in the race. Begin again with the most basic chapter, however small, and finish it thoroughly. Mastery of one easy thing today is worth more than five difficult things half-attempted.",
      hi: "यह गंभीर झटका है, पर आप अब भी इस यात्रा में बने हुए हैं। सबसे आधारभूत अध्याय से, चाहे वह कितना भी सरल हो, पुनः आरंभ कीजिए और उसे पूर्ण कीजिए। एक सरल विषय की आज की पूर्ण समझ पाँच कठिन विषयों के अधूरे प्रयास से अधिक मूल्यवान है।",
    },
    {
      en: "Do not let shame become silence. Talk to a trusted teacher or parent, share where you are stuck, and ask for one specific thing to do tomorrow. Real recovery begins the moment a student stops hiding from the question.",
      hi: "लज्जा को मौन न बनने दीजिए। किसी विश्वसनीय शिक्षक या परिजन से बात कीजिए, अपनी कठिनाई साझा कीजिए, और कल के लिए एक स्पष्ट कार्य पूछिए। सच्ची पुनर्प्राप्ति उसी क्षण आरंभ होती है जब विद्यार्थी प्रश्न से छिपना छोड़ देता है।",
    },
    {
      en: "The marks are low, but the lesson is clear: study habits need rebuilding from the ground up. Give yourself one quiet hour every evening — no screens, no excuses — and use it to read, write, and solve. Daily presence is the foundation of every recovery.",
      hi: "अंक कम हैं, परंतु पाठ स्पष्ट है: अध्ययन-आदतों को मूल से पुनः गढ़ना है। प्रत्येक संध्या स्वयं को एक शांत घंटा दीजिए — कोई स्क्रीन नहीं, कोई बहाना नहीं — और उसमें पढ़िए, लिखिए, हल कीजिए। प्रतिदिन की उपस्थिति प्रत्येक पुनर्प्राप्ति की नींव है।",
    },
    {
      en: "Many students who have stood here have stood among the toppers a year later — not by luck, but by perseverance through every small daily task. The path back is unglamorous: same time, same place, same effort, every single day. Begin today.",
      hi: "इस स्थान पर खड़े अनेक विद्यार्थी एक वर्ष बाद शीर्ष पर खड़े दिखे हैं — भाग्य से नहीं, प्रत्येक छोटे दैनिक कार्य की दृढ़ता से। वापसी का मार्ग साधारण है: वही समय, वही स्थान, वही परिश्रम — प्रतिदिन। आज से आरंभ कीजिए।",
    },
    {
      en: "This is the time for quiet, steady, daily effort — without promises, without panic. Forget last year for now; only the next twenty-four hours are in your hands. Open one book, finish one section, repeat tomorrow. Every comeback begins exactly like that.",
      hi: "यह समय शांत, स्थिर, दैनिक परिश्रम का है — बिना वचनों के, बिना घबराहट के। अभी बीते वर्ष को भूल जाइए; आपके हाथ में केवल आगामी चौबीस घंटे हैं। एक पुस्तक खोलिए, एक खंड समाप्त कीजिए, कल दोहराइए। हर सफल वापसी ऐसा ही आरंभ होती है।",
    },
  ],
};

/** FNV-1a 32-bit hash. Stable, fast, dependency-free. */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickRemark(
  grade: GradeBand,
  certificateId: string,
): RemarkTemplate {
  const list = REMARKS[grade];
  if (!list || list.length === 0) {
    throw new Error(`No remarks defined for grade band: ${grade}`);
  }
  const idx = fnv1a(certificateId) % list.length;
  return list[idx];
}
