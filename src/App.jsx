import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Phone, MapPin, ChevronRight, ChevronLeft, ChevronDown, Star, Shield, CheckCircle, AlertTriangle, Menu, X, Globe, DollarSign, Play, Zap, Navigation, ArrowRight, MessageCircle, CreditCard, Bitcoin, Briefcase, Flame, ShieldCheck, Clock, CheckSquare, Car, FileText, Lock, Users, Award, Map } from 'lucide-react';

const styles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.1); }
    50% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.4); }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -10%); }
    20% { transform: translate(-15%, 5%); }
    30% { transform: translate(7%, -25%); }
    40% { transform: translate(-5%, 25%); }
    50% { transform: translate(-15%, 10%); }
    60% { transform: translate(15%, 0%); }
    70% { transform: translate(0%, 15%); }
    80% { transform: translate(3%, 35%); }
    90% { transform: translate(-10%, 10%); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 3s infinite; }
  .animate-marquee { animation: marquee 8s linear infinite; }
  
  .bg-grain {
    position: fixed;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    width: 200%;
    height: 200vh;
    background: transparent url('https://assets.iceable.com/img/noise-transparent.png') repeat 0 0;
    background-repeat: repeat;
    animation: grain 8s steps(10) infinite;
    opacity: 0.03;
    z-index: 0;
    pointer-events: none;
  }
  .glass-card {
    background: rgba(10, 10, 10, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .glass-card:hover {
    background: rgba(20, 20, 20, 0.8);
    border-color: rgba(234, 179, 8, 0.3);
    box-shadow: 0 0 30px rgba(234, 179, 8, 0.1);
  }
  .carousel-slide {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.5;
    transform: scale(0.9);
    filter: grayscale(100%);
  }
  .carousel-slide.active {
    opacity: 1;
    transform: scale(1);
    filter: grayscale(0%);
    z-index: 10;
    box-shadow: 0 0 50px rgba(234, 179, 8, 0.15);
  }
`;

const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  MDL: 17.8,
  UAH: 41.5
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  MDL: 'L',
  UAH: '₴'
};

const LANGUAGES = {
  ru: { short: 'RU', label: 'Русский', flag: '🇷🇺' },
  ua: { short: 'UA', label: 'Українська', flag: '🇺🇦' },
  ro: { short: 'RO', label: 'Română', flag: '🇷🇴' },
  en: { short: 'EN', label: 'English', flag: '🇬🇧' }
};

const ROUTE_DEFINITIONS = [
  { from: 'odessa', to: 'chisinau', priceUSD: 180 },
  { from: 'odessa', to: 'kiev', priceUSD: 280 },
  { from: 'odessa', to: 'palanca', priceUSD: 50 },
  { from: 'chisinau', to: 'kiev', priceUSD: 500 },
  { from: 'chisinau', to: 'bucharest', priceUSD: 450 },
  { from: 'kiev', to: 'warsaw', priceUSD: 650 },
  { from: 'dnipro', to: 'chisinau', priceUSD: 550 },
  { from: 'dnipro', to: 'bucharest', priceUSD: 900 },
];

// Функция проверки существования видео
const checkVideoExists = (url) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.remove();
      resolve(true);
    };
    video.onerror = () => {
      video.remove();
      resolve(false);
    };
    video.src = url;
  });
};

// Используем синхронную версию для начальной загрузки
const VIDEO_LIST = [
  { id: 1, videoUrl: "/video/1.mp4" },
  { id: 2, videoUrl: "/video/2.mp4" },
  { id: 3, videoUrl: "/video/3.mp4" },
  { id: 4, videoUrl: "/video/4.mp4" },
  { id: 5, videoUrl: "/video/5.mp4" }
];

const CARS = [
  {
    id: 1,
    key: 'car1',
    image: "/images/models/Toyota_Camry.jpg"
  },
  {
    id: 2,
    key: 'car2',
    image: "/images/models/Mercedes_Benz V_Class .jpg"
  },
  {
    id: 3,
    key: 'car3',
    image: "/images/models/Mercedes_Benz E_Class.jpg"
  }
];

/* --- TRANSLATIONS --- */
const content = {
  ru: {
    meta: {
      title: "KORTEGE.md - Трансфер Украина Молдова Румыния | Премиум Кортеж",
      description: "Премиум трансфер между Украиной, Молдовой и Румынией. Надежные водители с паспортами ЕС, комфортные авто, конфиденциальность. Заказать кортеж 24/7."
    },
    nav: { fleet: "Автопарк", rates: "Тарифы", risks: "Надежность", faq: "FAQ", contact: "Связаться", book: "ЗАКАЗАТЬ", tagline: "Дипломат Трансфер" },
    cities: {
      odessa: "Одесса", kiev: "Киев", chisinau: "Кишинев", bucharest: "Бухарест", warsaw: "Варшава", dnipro: "Днепр", palanca: "Паланка"
    },
    hero: {
      badge: "Персональный кортеж",
      title: "ТРАНСФЕР ВЫСШЕГО УРОВНЯ",
      subtitle: "Украина ⇄ Молдова ⇄ Румыния",
      desc: "Больше чем такси. Мы обеспечиваем надежность, пунктуальность и комфорт.",
      cta: "ЗАКАЗАТЬ КОРТЕЖ",
      sub_cta: "24/7 • Опытные водители • Комфорт"
    },
    marquee: "• ВОДИТЕЛИ С ПАСПОРТАМИ ЕС • ГАРАНТИЯ ПОДАЧИ • ПУНКТУАЛЬНОСТЬ • КОМФОРТ • KORTÉGE •",
    risks: {
      title: "ПУТЕШЕСТВИЕ БЕЗ ЛИШНИХ НЕРВОВ",
      pain1_title: "Ненадежный водитель",
      pain1_desc: "Риск того, что водитель без документов не сможет выехать за границу, сорвав вашу поездку.",
      pain2_title: "Риск опоздания",
      pain2_desc: "Неправильный расчет времени может стоить вам билета на самолет.",
      pain3_title: "Дискомфорт в пути",
      pain3_desc: "Долгая дорога в неудобном авто может испортить все впечатление.",
      sol_title: "НАШ СТАНДАРТ:",
      sol1: "Водители с паспортами EU. Гарантированный выезд.",
      sol2: "Оптимальная логистика. Точный расчет времени.",
      sol3: "Комфорт-класс. Отдыхайте в пути.",
      btn: "ГАРАНТИРОВАТЬ КОМФОРТ"
    },
    fleet: {
      subtitle: "АВТОПАРК",
      title: "ГАРАЖ ПРЕМИУМ КЛАССА",
      choose: "Выбери свой уровень",
      book_btn: "ВЫБРАТЬ ЭТОТ БОРТ",
      cars: {
        car1: {
          name: "Toyota Camry",
          type: "Business Class",
          specs: ["Wi-Fi", "Комфорт", "Кондиционер", "Кожаный салон"],
          desc: "Надежный седан бизнес-класса для комфортных поездок."
        },
        car2: {
          name: "Mercedes-Benz V-Class",
          type: "VIP",
          badge: "Most Wanted",
          specs: ["7 мест", "Стол", "Климат-контроль", "Просторный салон"],
          desc: "Просторный минивэн VIP-класса для семьи или группы."
        },
        car3: {
          name: "Mercedes-Benz E-Class",
          type: "Premium",
          specs: ["Wi-Fi", "Премиум-салон", "Климат-зона", "Комфорт"],
          desc: "Премиальный седан с максимальным комфортом и стилем."
        }
      }
    },
    process: {
      title: "КАК МЫ РАБОТАЕМ",
      subtitle: "Ваш путь от заявки до цели",
      step1_title: "Заявка",
      step1_desc: "Вы оставляете контакт или пишете нам в мессенджер.",
      step2_title: "Детали",
      step2_desc: "Мы связываемся, уточняем маршрут, авто и особые пожелания.",
      step3_title: "Подача",
      step3_desc: "Водитель встречает вас точно в срок. Помогаем с багажем.",
      step4_title: "Поездка",
      step4_desc: "Безопасная и комфортная поездка до двери назначения."
    },
    stats: {
      s1_val: "5+", s1_label: "Лет опыта",
      s2_val: "6k+", s2_label: "Успешных рейсов",
      s3_val: "100%", s3_label: "Успех на границе",
      s4_val: "24/7", s4_label: "Поддержка"
    },
    routes: {
      title: "НАПРАВЛЕНИЯ",
      subtitle: "Валюта расчета:",
      note: "*Индивидуальный расчет под каждый каприз.",
      from: "Откуда",
      to: "Куда",
      price: "Цена",
      start_at: "От",
      custom_title: "ДРУГОЙ МАРШРУТ",
      custom_desc: "Рассчитать индивидуально",
      custom_btn: "РАССЧИТАТЬ"
    },
    reviews: {
      title: "ОПЫТ КЛИЕНТОВ",
      subtitle: "Реальные истории",
      watch: "СМОТРЕТЬ ИСТОРИЮ"
    },
    faq: {
      title: "ОТВЕТЫ НА ВОПРОСЫ",
      subtitle: "Все нюансы вашей поездки",
      q1: "Как происходит пересечение границы?",
      a1: "Наши водители имеют большой опыт международных поездок и знают все процедуры. Вы остаетесь в комфорте, мы помогаем с формальностями.",
      q2: "Какие способы оплаты вы принимаете?",
      a2: "Любые удобные для вас: Наличные (USD/EUR/MDL), Банковская карта, USDT (Crypto) или безналичный расчет (Invoice) для юридических лиц.",
      q3: "Что делать, если мой рейс задержится?",
      a3: "Мы отслеживаем статус рейсов в реальном времени. Водитель будет ждать вас столько, сколько нужно. Первый час ожидания — бесплатно.",
      q4: "Есть ли гарантия конфиденциальности?",
      a4: "Абсолютная. Информация о пассажирах и маршрутах нигде не фиксируется и удаляется сразу после завершения поездки.",
      q5: "Можно ли с домашними животными?",
      a5: "Конечно. Мы Pet-friendly. Просто предупредите нас заранее, чтобы мы подготовили защитное покрытие для салона. Ваш питомец поедет с комфортом.",
      q6: "Есть ли детские кресла?",
      a6: "Да, мы предоставляем премиальные детские кресла под любой возраст бесплатно. Безопасность детей — наш приоритет.",
      q7: "Есть ли Wi-Fi и зарядки в авто?",
      a7: "Во всех авто есть высокоскоростной Wi-Fi (включая Starlink в некоторых моделях) и зарядные устройства Type-C/Lightning для любых гаджетов.",
      q8: "Можно ли курить в салоне?",
      a8: "В базовых тарифах курение (включая IQOS) запрещено для сохранения свежести. Но мы можем делать остановки по требованию или предоставить авто с опцией 'Smoking Allowed'.",
      q9: "Мы можем заехать в другой город по пути?",
      a9: "Абсолютно. Вы арендуете не просто такси, а личного водителя. Маршрут можно корректировать прямо в процессе поездки.",
      q10: "Застрахованы ли пассажиры?",
      a10: "Да, каждый пассажир и багаж застрахованы на время поездки. Мы работаем только официально с полным пакетом документов."
    },
    contact: {
      title_pre: "ГОТОВ К",
      title_accent: "ПОЕЗДКЕ?",
      btn: "ВЫЗВАТЬ KORTÉGE",
      cities: ["Одесса", "Киев", "Кишинев", "Бухарест", "Варшава"],
      payment: "МЫ ПРИНИМАЕМ:"
    },
    footer: {
      rights: "ВСЕ ПРАВА ЗАЩИЩЕНЫ.",
      privacy: "Конфиденциальность",
      terms: "Условия"
    },
    form: {
      title: "ЗАПУСК ПРОЦЕССА",
      name: "Ваше имя",
      phone: "Телефон / TG / WhatsApp",
      date: "Дата выезда",
      route: "Маршрут",
      car: "Предпочтение по авто",
      submit: "ПОДТВЕРДИТЬ БРОНЬ",
      success: "Заявка в обработке. Ожидайте звонка."
    },
    legal: {
      privacy_title: "Политика Конфденциальности",
      privacy_text: [
        "1. KORTÉGE гарантирует полную анонимность всех клиентов.",
        "2. Мы не храним историю ваших поездок более 24 часов после завершения маршрута.",
        "3. Данные о пассажирах (ФИО, документы) используются исключительно для поездки.",
        "4. Все разговоры внутри автомобиля являются строго конфиденциальными.",
        "5. Видеорегистраторы в салоне (если есть) настраиваются на дорогу и не фиксируют пассажиров."
      ],
      terms_title: "Условия Обслуживания",
      terms_text: [
        "1. Бронювання вважається підтвердженим лише після узгодження з менеджером.",
        "2. Безкоштовне скасування бронювання можливе не пізніше ніж за 24 години до подачі авто.",
        "3. У разі затримки рейсу, перша година очікування включена у вартість.",
        "4. Пасажири несуть відповідальність за наявність чинних документів для перетину кордону.",
        "5. Компанія залишає за собою право відмовити в поїздці особам у стані сильного алкогольного сп'яніння."
      ]
    }
  },
  ua: {
    meta: {
      title: "KORTEGE.md - Трансфер Україна Молдова Румунія | Преміум Кортеж",
      description: "Преміум трансфер між Україною, Молдовою та Румунією. Надійні водії з паспортами ЄС, комфортні авто, конфіденційність. Замовити кортеж 24/7."
    },
    nav: { fleet: "Автопарк", rates: "Тарифи", risks: "Надійність", faq: "FAQ", contact: "Зв'язатися", book: "ЗАМОВИТИ", tagline: "Дипломатичний Стандарт" },
    cities: {
      odessa: "Одеса", kiev: "Київ", chisinau: "Кишинів", bucharest: "Бухарест", warsaw: "Варшава", dnipro: "Дніпро", palanca: "Паланка"
    },
    hero: {
      badge: "Персональний кортеж",
      title: "ТРАНСФЕР ВИЩОГО РІВНЯ",
      subtitle: "Україна ⇄ Молдова ⇄ Румунія",
      desc: "Більше ніж таксі. Ми забезпечуємо надійність, пунктуальність та комфорт.",
      cta: "ЗАМОВИТИ КОРТЕЖ",
      sub_cta: "24/7 • Анонімно • Швидко"
    },
    marquee: "• ПАСПОРТИ ЄС У ВОДІЇВ • ГАРАНТІЯ ПОДАЧІ • ПУНКТУАЛЬНІСТЬ • КОМФОРТ • KORTÉGE •",
    risks: {
      title: "ПОДОРОЖ БЕЗ ЗАЙВИХ НЕРВІВ",
      pain1_title: "Ненадійний водій",
      pain1_desc: "Ризик того, що водій без документів не зможе виїхати за кордон, зірвавши вашу поїздку.",
      pain2_title: "Ризик запізнення",
      pain2_desc: "Неправильний розрахунок часу може коштувати вам квитка на літак.",
      pain3_title: "Дискомфорт у дорозі",
      pain3_desc: "Довга дорога у незручному авто може зіпсувати все враження.",
      sol_title: "НАШ СТАНДАРТ:",
      sol1: "Водії з паспортами EU. Гарантований виїзд.",
      sol2: "Оптимальна логістика. Точний розрахунок часу.",
      sol3: "Комфорт-клас. Відпочивайте в дорозі.",
      btn: "ГАРАНТУВАТИ КОМФОРТ"
    },
    fleet: {
      subtitle: "АВТОПАРК",
      title: "ГАРАЖ ПРЕМІУМ КЛАСУ",
      choose: "Обери свій шатл",
      book_btn: "ОБРАТИ ЦЕЙ БОРТ",
      cars: {
        car1: {
          name: "Toyota Camry",
          type: "Business Class",
          specs: ["Wi-Fi", "Комфорт", "Кондиціонер", "Шкіряний салон"],
          desc: "Надійний седан бізнес-класу для комфортних поїздок."
        },
        car2: {
          name: "Mercedes-Benz V-Class",
          type: "VIP",
          badge: "Most Wanted",
          specs: ["7 місць", "Стіл", "Клімат-контроль", "Просторий салон"],
          desc: "Просторий мінівен VIP-класу для сім'ї або групи."
        },
        car3: {
          name: "Mercedes-Benz E-Class",
          type: "Premium",
          specs: ["Wi-Fi", "Преміум-салон", "Клімат-зона", "Комфорт"],
          desc: "Преміальний седан з максимальним комфортом та стилем."
        }
      }
    },
    process: {
      title: "ЯК МИ ПРАЦЮЄМО",
      subtitle: "Ваш шлях від заявки до мети",
      step1_title: "Заявка",
      step1_desc: "Ви залишаєте контакт або пишете нам у месенджер.",
      step2_title: "Деталі",
      step2_desc: "Ми зв'язуємося, уточнюємо маршрут, авто та побажання.",
      step3_title: "Подача",
      step3_desc: "Водій зустрічає вас точно вчасно. Допомагаємо з багажем.",
      step4_title: "Поїздка",
      step4_desc: "Безпечна та комфортна поїздка до дверей призначення."
    },
    stats: {
      s1_val: "5+", s1_label: "Років досвіду",
      s2_val: "6k+", s2_label: "Успішних рейсів",
      s3_val: "100%", s3_label: "Успіх на кордоні",
      s4_val: "24/7", s4_label: "Підтримка"
    },
    routes: {
      title: "НАПРЯМКИ",
      subtitle: "Валюта розрахунку:",
      note: "*Індивідуальний розрахунок під кожну примху.",
      from: "Звідки",
      to: "Куди",
      price: "Ціна",
      start_at: "Від",
      custom_title: "ІНШИЙ МАРШРУТ",
      custom_desc: "Розрахувати індивідуально",
      custom_btn: "РОЗРАХУВАТИ"
    },
    reviews: {
      title: "ДОСВІД КЛІЄНТІВ",
      subtitle: "Реальні історії",
      watch: "ДИВИТИСЯ ІСТОРІЮ"
    },
    faq: {
      title: "ВІДПОВІДІ НА ПИТАННЯ",
      subtitle: "Всі нюанси вашої поїздки",
      q1: "Як відбувається перетин кордону?",
      a1: "Наші водії мають великий досвід міжнародних поїздок і знають всі процедури. Ви залишаєтесь в комфорті, ми допомагаємо з формальностями.",
      q2: "Які способи оплати?",
      a2: "Будь-які зручні для вас: Готівка (USD/EUR), Банківська карта, USDT/Crypto, Безготівковий розрахунок для юр. осіб.",
      q3: "Що якщо мій рейс затримається?",
      a3: "Ми відстежуємо рейси. Очікування до 1 години – безкоштовно. Водій зустріне вас із табличкою у будь-якому випадку.",
      q4: "Чи є гарантія конфіденційності?",
      a4: "Абсолютна. Інформація про пасажирів та маршрути ніде не публікується і видаляється після поїздки.",
      q5: "Чи можна з домашніми тваринами?",
      a5: "Звичайно. Ми Pet-friendly. Просто попередьте нас заздалегідь, щоб ми підготували захисне покриття для салону.",
      q6: "Чи є дитячі крісла?",
      a6: "Так, ми надаємо преміальні дитячі крісла під будь-який вік безкоштовно. Безпека дітей – наш пріоритет.",
      q7: "Чи є Wi-Fi та зарядки в авто?",
      a7: "У всіх авто є високошвидкісний Wi-Fi (включаючи Starlink у деяких моделях) та зарядні пристрої Type-C/Lightning.",
      q8: "Чи можна палити в салоні?",
      a8: "У базових тарифах куріння заборонено. Але ми можемо робити зупинки на вимогу або надати авто з опцією 'Smoking Allowed'.",
      q9: "Ми можемо заїхати в інше місто по дорозі?",
      a9: "Абсолютно. Ви орендуєте не просто таксі, а особистого водія. Маршрут можна коригувати прямо в процесі.",
      q10: "Чи застраховані пасажири?",
      a10: "Так, кожен пасажир та багаж застраховані на час поїздки. Ми працюємо тільки офіційно."
    },
    contact: {
      title_pre: "ГОТОВИЙ ДО",
      title_accent: "ПОЇЗДКИ?",
      btn: "ВИКЛИКАТИ KORTÉGE",
      cities: ["Одеса", "Київ", "Кишинів", "Бухарест", "Варшава"],
      payment: "МИ ПРИЙМАЄМО:"
    },
    footer: {
      rights: "ВСІ ПРАВА ЗАХИЩЕНІ.",
      privacy: "Конфіденційність",
      terms: "Умови"
    },
    form: {
      title: "ЗАПУСК ПРОЦЕСУ",
      name: "Ваше ім'я",
      phone: "Телефон / TG / WhatsApp",
      date: "Дата виїзду",
      route: "Маршрут",
      car: "Бажане авто",
      submit: "ПІДТВЕРДИТИ БРОНЮ",
      success: "Заявка в обробці. Чекайте дзвінка."
    },
    legal: {
      privacy_title: "Політика Конфіденційності",
      privacy_text: [
        "1. KORTÉGE гарантує повну анонімність усіх клієнтів.",
        "2. Ми не зберігаємо історію ваших поїздок більше 24 годин після завершення маршруту.",
        "3. Дані про пасажирів використовуються виключно для поїздки.",
        "4. Всі розмови всередині автомобіля є строго конфіденційними.",
        "5. Відеореєстратори в салоні (якщо є) налаштовуються на дорогу і не фіксують пасажирів."
      ],
      terms_title: "Умови Обслуговування",
      terms_text: [
        "1. Бронювання вважається підтвердженим лише після узгодження з менеджером.",
        "2. Безкоштовне скасування бронювання можливе не пізніше ніж за 24 години до подачі авто.",
        "3. У разі затримки рейсу, перша година очікування включена у вартість. Далі — за тарифом простою.",
        "4. Пасажири несуть відповідальність за наявність чинних документів для перетину кордону.",
        "5. Компанія залишає за собою право відмовити в поїздці особам у стані сильного алкогольного сп'яніння."
      ]
    }
  },
  ro: {
    meta: {
      title: "KORTEGE.md - Transfer Ucraina Moldova România | Cortegiu Premium",
      description: "Transfer premium între Ucraina, Moldova și România. Șoferi de încredere cu pașapoarte UE, mașini confortabile, confidențialitate. Rezervă cortegiu 24/7."
    },
    nav: { fleet: "Flota", rates: "Tarife", risks: "Fiabilitate", faq: "FAQ", contact: "Contact", book: "REZERVĂ", tagline: "Diplomat Transfer" },
    cities: {
      odessa: "Odesa", kiev: "Kiev", chisinau: "Chișinău", bucharest: "București", warsaw: "Varșovia", dnipro: "Dnipro", palanca: "Palanca"
    },
    hero: {
      badge: "Cortegiu personal",
      title: "TRANSFER DE NIVEL ÎNALT",
      subtitle: "Ucraina ⇄ Moldova ⇄ România",
      desc: "Mai mult decât un taxi. Oferim fiabilitate, punctualitate și statut.",
      cta: "REZERVĂ KORTÉGE",
      sub_cta: "24/7 • Anonim • Rapid"
    },
    marquee: "• PAȘAPOARTE UE • CONFIDENȚIALITATE • PUNCTUALITATE • CONFORT • KORTÉGE •",
    risks: {
      title: "CĂLĂTORIE FĂRĂ GRIJI",
      pain1_title: "Șofer nesigur",
      pain1_desc: "Riscul ca un șofer fără documente să nu poată părăsi țara, stricând planurile.",
      pain2_title: "Risc de întârziere",
      pain2_desc: "Calculul greșit al timpului vă poate costa biletul de avion.",
      pain3_title: "Disconfort",
      pain3_desc: "Un drum lung într-o mașină inconfortabilă poate strica experiența.",
      sol_title: "STANDARDUL NOSTRU:",
      sol1: "Șoferi cu pașapoarte EU. Plecare garantată.",
      sol2: "Logistică optimă. Calcul precis al timpului.",
      sol3: "Clasa confort. Relaxați-vă pe drum.",
      btn: "GARANTEAZĂ CONFORTUL"
    },
    fleet: {
      subtitle: "PARC AUTO",
      title: "GARAJ PREMIUM",
      choose: "Alege nivelul tău",
      book_btn: "ALEGE ACEASTĂ MAȘINĂ",
      cars: {
        car1: {
          name: "Toyota Camry",
          type: "Business Class",
          specs: ["Wi-Fi", "Confort", "Aer condiționat", "Interior piele"],
          desc: "Sedan de business clasa pentru călătorii confortabile."
        },
        car2: {
          name: "Mercedes-Benz V-Class",
          type: "VIP",
          badge: "Most Wanted",
          specs: ["7 locuri", "Masă", "Control climat", "Spațios"],
          desc: "Minivan spațios VIP pentru familie sau grup."
        },
        car3: {
          name: "Mercedes-Benz E-Class",
          type: "Premium",
          specs: ["Wi-Fi", "Interior premium", "Zonă climat", "Confort"],
          desc: "Sedan premium cu confort și stil maxim."
        }
      }
    },
    process: {
      title: "CUM LUCRĂM",
      subtitle: "Drumul tău de la cerere la destinație",
      step1_title: "Cerere",
      step1_desc: "Lăsați un contact sau ne scrieți pe messenger.",
      step2_title: "Detalii",
      step2_desc: "Vă contactăm, clarificăm ruta, mașina și dorințele.",
      step3_title: "Preluare",
      step3_desc: "Șoferul vă întâmpină exact la timp. Ajutăm cu bagajele.",
      step4_title: "Călătorie",
      step4_desc: "Călătorie sigură și confortabilă până la destinație."
    },
    stats: {
      s1_val: "5+", s1_label: "Ani de experiență",
      s2_val: "6k+", s2_label: "Călătorii reușite",
      s3_val: "100%", s3_label: "Succes la vamă",
      s4_val: "24/7", s4_label: "Suport"
    },
    routes: {
      title: "DESTINAȚII",
      subtitle: "Alege moneda:",
      note: "*Calcul individual.",
      from: "De unde",
      to: "Unde",
      price: "Preț",
      start_at: "De la",
      custom_title: "ALTĂ RUTĂ",
      custom_desc: "Calcul individual",
      custom_btn: "CALCULEAZĂ"
    },
    reviews: {
      title: "RECENZII",
      subtitle: "Cazuri reale",
      watch: "VEZI POVESTEA"
    },
    faq: {
      title: "ÎNTREBĂRI FRECVENTE",
      subtitle: "Tot ce trebuie să știi",
      q1: "Cum se trece frontiera?",
      a1: "Șoferii noștri au experiență internațională și cunosc procedurile. Vă bucurați de confort, noi ajutăm cu formalitățile.",
      q2: "Metode de plată?",
      a2: "Oricare: Cash (USD/EUR), Card, Crypto (USDT), Transfer bancar (Factură).",
      q3: "Dacă zborul are întârziere?",
      a3: "Monitorizăm zborurile. Așteptarea de până la o oră este gratuită. Șoferul vă așteaptă oricum.",
      q4: "Confidențialitate?",
      a4: "Garantată 100%. Datele sunt șterse imediat după călătorie.",
      q5: "Pot călători cu animale?",
      a5: "Sigur. Suntem Pet-friendly. Anunțați-ne doar în avans.",
      q6: "Aveți scaune pentru copii?",
      a6: "Da, oferim scaune premium pentru orice vârstă gratuit. Siguranța copiilor e prioritară.",
      q7: "Există Wi-Fi și încărcătoare?",
      a7: "Toate mașinile au Wi-Fi rapid și încărcătoare Type-C/Lightning.",
      q8: "Se poate fuma în mașină?",
      a8: "În tarifele standard fumatul e interzis. Putem face opriri sau oferim mașini 'Smoking Allowed' la cerere.",
      q9: "Putem opri în alt oraș pe drum?",
      a9: "Absolut. Ruta poate fi ajustată în timpul călătoriei.",
      q10: "Pasagerii sunt asigurați?",
      a10: "Da, toți pasagerii și bagajele sunt asigurate complet."
    },
    contact: {
      title_pre: "GATA DE",
      title_accent: "DRUM?",
      btn: "SOLICITĂ KORTÉGE",
      cities: ["Odesa", "Kiev", "Chișinău", "București", "Varșovia"],
      payment: "ACCEPTĂM:"
    },
    footer: {
      rights: "TOATE DREPTURILE REZERVATE.",
      privacy: "Confidențialitate",
      terms: "Termeni"
    },
    form: {
      title: "LANSARE COMANDĂ",
      name: "Nume",
      phone: "Telefon / TG / WhatsApp",
      date: "Data",
      route: "Ruta",
      car: "Mașina dorită",
      submit: "CONFIRMĂ REZERVAREA",
      success: "Cerere acceptată."
    },
    legal: {
      privacy_title: "Politica de Confidențialitate",
      privacy_text: [
        "1. KORTÉGE garantează anonimatul deplin al tuturor clienților.",
        "2. Nu păstrăm istoricul călătoriilor dvs. mai mult de 24 de ore.",
        "3. Datele pasagerilor sunt utilizate exclusiv pentru călătorie.",
        "4. Toate conversațiile din interiorul mașinii sunt strict confidențiale.",
        "5. Camerele de bord (dacă există) sunt îndreptate spre drum și nu înregistrează pasagerii."
      ],
      terms_title: "Termeni și Condiții",
      terms_text: [
        "1. Rezervarea este confirmată numai după acordul managerului.",
        "2. Anularea gratuită este posibilă cu cel târziu 24 de ore înainte.",
        "3. În cazul întârzierii zborului, prima oră de așteptare este inclusă în preț.",
        "4. Pasagerii sunt responsabili pentru deținerea documentelor valabile pentru trecerea frontierei.",
        "5. Compania își rezervă dreptul de a refuza călătoria persoanelor aflate în stare avansată de ebrietate."
      ]
    }
  },
  en: {
    meta: {
      title: "KORTEGE.md - Transfer Ukraine Moldova Romania | Premium Motorcade",
      description: "Premium transfer between Ukraine, Moldova and Romania. Reliable drivers with EU passports, comfortable cars, confidentiality. Book motorcade 24/7."
    },
    nav: { fleet: "Fleet", rates: "Rates", risks: "Reliability", faq: "FAQ", contact: "Contact", book: "BOOK NOW", tagline: "Diplomat Transfer" },
    cities: {
      odessa: "Odessa", kiev: "Kyiv", chisinau: "Chisinau", bucharest: "Bucharest", warsaw: "Warsaw", dnipro: "Dnipro", palanca: "Palanca"
    },
    hero: {
      badge: "Personal Motorcade",
      title: "TOP TIER TRANSFER",
      subtitle: "Ukraine ⇄ Moldova ⇄ Romania",
      desc: "More than a taxi. We provide reliability, punctuality, and comfort.",
      cta: "BOOK KORTÉGE",
      sub_cta: "24/7 • Anonymous • Fast"
    },
    marquee: "• EU PASSPORTS • RELIABILITY • PUNCTUALITY • COMFORT • KORTÉGE •",
    risks: {
      title: "TRIP WITHOUT STRESS",
      pain1_title: "Unreliable Driver",
      pain1_desc: "Risk of a driver without docs being unable to leave the country, ruining your trip.",
      pain2_title: "Risk of Delay",
      pain2_desc: "Incorrect time calculation can cost you a flight ticket.",
      pain3_title: "Discomfort",
      pain3_desc: "A long road in an uncomfortable car can spoil the whole experience.",
      sol_title: "OUR STANDARD:",
      sol1: "Drivers with EU passports. Guaranteed departure.",
      sol2: "Optimal logistics. Precise timing.",
      sol3: "Comfort class. Relax on the way.",
      btn: "GUARANTEE COMFORT"
    },
    fleet: {
      subtitle: "FLEET",
      title: "PREMIUM GARAGE",
      choose: "Choose your shuttle",
      book_btn: "SELECT THIS CRAFT",
      cars: {
        car1: {
          name: "Toyota Camry",
          type: "Business Class",
          specs: ["Wi-Fi", "Comfort", "Air Conditioning", "Leather Interior"],
          desc: "Reliable business class sedan for comfortable trips."
        },
        car2: {
          name: "Mercedes-Benz V-Class",
          type: "VIP",
          badge: "Most Wanted",
          specs: ["7 Seats", "Table", "Climate Control", "Spacious"],
          desc: "Spacious VIP minivan for family or group."
        },
        car3: {
          name: "Mercedes-Benz E-Class",
          type: "Premium",
          specs: ["Wi-Fi", "Premium Interior", "Climate Zone", "Comfort"],
          desc: "Premium sedan with maximum comfort and style."
        }
      }
    },
    process: {
      title: "HOW IT WORKS",
      subtitle: "Your path from request to destination",
      step1_title: "Request",
      step1_desc: "Leave a contact or write to us on messenger.",
      step2_title: "Details",
      step2_desc: "We contact you, clarify route, car and wishes.",
      step3_title: "Pickup",
      step3_desc: "Driver meets you exactly on time. We help with luggage.",
      step4_title: "Trip",
      step4_desc: "Safe and comfortable trip to your destination door."
    },
    stats: {
      s1_val: "5+", s1_label: "Years Experience",
      s2_val: "6k+", s2_label: "Successful Trips",
      s3_val: "100%", s3_label: "Border Success",
      s4_val: "24/7", s4_label: "Support"
    },
    routes: {
      title: "DESTINATIONS",
      subtitle: "Select currency:",
      note: "*Individual calculation.",
      from: "From",
      to: "To",
      price: "Price",
      start_at: "Starting at",
      custom_title: "CUSTOM ROUTE",
      custom_desc: "Individual calculation",
      custom_btn: "CALCULATE"
    },
    reviews: {
      title: "CLIENT EXPERIENCE",
      subtitle: "Real stories",
      watch: "WATCH STORY"
    },
    faq: {
      title: "F.A.Q.",
      subtitle: "Everything needed for your trip",
      q1: "How is the border crossing?",
      a1: "Our drivers have international experience and know procedures. You stay in comfort, we help with formalities.",
      q2: "Payment methods?",
      a2: "Any: Cash (USD/EUR), Card, USDT/Crypto, Invoice for companies.",
      q3: "Flight delayed?",
      a3: "We track flights. 1 hour waiting is free. Meet & Greet is included.",
      q4: "Privacy guarantee?",
      a4: "Absolute. Passenger data is never published and is deleted immediately after the trip.",
      q5: "Are pets allowed?",
      a5: "Yes, we are Pet-friendly. Just let us know in advance so we can prepare the car protection.",
      q6: "Do you have child seats?",
      a6: "Yes, premium child seats for all ages are provided for free.",
      q7: "Is there Wi-Fi and power?",
      a7: "All cars have high-speed Wi-Fi (including Starlink in some) and Type-C/Lightning chargers.",
      q8: "Is smoking allowed?",
      a8: "Smoking is prohibited in standard rates. We can make stops or provide 'Smoking Allowed' cars upon request.",
      q9: "Can we stop in another city?",
      a9: "Absolutely. You rent a personal driver, not just a taxi. The route is flexible.",
      q10: "Are passengers insured?",
      a10: "Yes, every passenger and luggage is fully insured during the trip."
    },
    contact: {
      title_pre: "READY FOR",
      title_accent: "TAKEOFF?",
      btn: "REQUEST KORTÉGE",
      cities: ["Odessa", "Kyiv", "Chisinau", "Bucharest", "Warsaw"],
      payment: "WE ACCEPT:"
    },
    footer: {
      rights: "ALL RIGHTS RESERVED.",
      privacy: "Privacy",
      terms: "Terms"
    },
    form: {
      title: "START PROCESS",
      name: "Your Name",
      phone: "Phone / TG / WhatsApp",
      date: "Date",
      route: "Route",
      car: "Preferred Car",
      submit: "CONFIRM BOOKING",
      success: "Request processing. Wait for a call."
    },
    legal: {
      privacy_title: "Privacy Policy",
      privacy_text: [
        "1. KORTÉGE guarantees full anonymity for all clients.",
        "2. We do not store your travel history for more than 24 hours after completion.",
        "3. Passenger data (Name, ID) is used solely for the trip and is not shared with third parties.",
        "4. All conversations inside the vehicle are strictly confidential.",
        "5. Dashcams (if any) are pointed at the road and do not record passengers."
      ],
      terms_title: "Terms of Service",
      terms_text: [
        "1. Booking is confirmed only after agreement with the manager.",
        "2. Free cancellation is possible no later than 24 hours before pickup.",
        "3. In case of flight delay, the first hour of waiting is included.",
        "4. Passengers are responsible for having valid documents for border crossing.",
        "5. The company reserves the right to refuse service to intoxicated persons."
      ]
    }
  }
};

const RunningText = ({ text }) => {
  return (
    <div className="relative w-full bg-yellow-500 overflow-hidden py-3 -rotate-1 border-y-4 border-black shadow-[0_0_20px_rgba(234,179,8,0.3)] z-20">
      <div className="whitespace-nowrap flex animate-marquee">
        <span className="text-black font-black text-xl md:text-2xl uppercase tracking-widest mx-4">{text}</span>
        <span className="text-black font-black text-xl md:text-2xl uppercase tracking-widest mx-4">{text}</span>
        <span className="text-black font-black text-xl md:text-2xl uppercase tracking-widest mx-4">{text}</span>
        <span className="text-black font-black text-xl md:text-2xl uppercase tracking-widest mx-4">{text}</span>
      </div>
    </div>
  );
};

const FAQ = ({ t }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
  const questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {questions.map((q) => (
        <div key={q} className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-300 hover:border-yellow-500/30">
          <button 
            onClick={() => toggle(q)}
            className="w-full flex justify-between items-center p-6 text-left"
          >
            <span className="text-lg font-bold text-white">{t[`q${q}`]}</span>
            <ChevronDown className={`text-yellow-500 transition-transform duration-300 ${openIndex === q ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openIndex === q ? 'max-h-48' : 'max-h-0'}`}>
            <p className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
              {t[`a${q}`]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const FloatingContacts = ({ openBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "380756953174"; 

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-10 mb-2">
           <a 
             href={`https://t.me/+${phoneNumber}`} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="flex items-center gap-3 bg-[#0088cc] text-white px-4 py-3 rounded-full shadow-lg font-bold hover:scale-110 transition-transform"
           >
             <span className="text-sm">Telegram</span> <Navigation size={20} />
           </a>
           <a 
             href={`https://wa.me/${phoneNumber}`} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg font-bold hover:scale-110 transition-transform"
           >
             <span className="text-sm">WhatsApp</span> <Phone size={20} />
           </a>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 text-black w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-110 transition-transform animate-pulse-glow"
      >
        {isOpen ? <X size={30} /> : <MessageCircle size={32} fill="black" />}
      </button>
    </div>
  );
};

const CarCarousel = ({ cars, t, openBooking }) => {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const next = () => setActive((prev) => (prev + 1) % cars.length);
  const prev = () => setActive((prev) => (prev - 1 + cars.length) % cars.length);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      next();
    }
    if (isRightSwipe) {
      prev();
    }
  };

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto px-4 perspective-1000"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex justify-center items-center h-[500px] md:h-[600px] relative">
        <button onClick={prev} className="absolute left-0 md:left-10 z-30 p-4 bg-black/50 hover:bg-yellow-500 hover:text-black rounded-full border border-yellow-500/50 transition-all backdrop-blur-md hidden md:block">
          <ChevronLeft size={30} />
        </button>
        <button onClick={next} className="absolute right-0 md:right-10 z-30 p-4 bg-black/50 hover:bg-yellow-500 hover:text-black rounded-full border border-yellow-500/50 transition-all backdrop-blur-md hidden md:block">
          <ChevronRight size={30} />
        </button>

        {cars.map((car, i) => {
          let offset = (i - active + cars.length) % cars.length;
          if (offset > cars.length / 2) offset -= cars.length;
          
          let isActive = i === active;
          let isPrev = offset === -1;
          let isNext = offset === 1;
          let isHidden = !isActive && !isPrev && !isNext;

          return (
            <div 
              key={car.id} 
              className={`absolute top-0 w-full md:w-[600px] transition-all duration-700 ease-out p-4 ${isHidden ? 'pointer-events-none' : ''}`}
              style={{ 
                transform: isHidden ? 'scale(0)' : undefined, 
              }}
            >
              <div className={`relative bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${isActive ? 'scale-100 opacity-100 z-20 shadow-[0_0_50px_rgba(234,179,8,0.2)] border-yellow-500/50' : isPrev ? '-translate-x-full md:-translate-x-[60%] scale-90 opacity-40 md:blur-[1px]' : isNext ? 'translate-x-full md:translate-x-[60%] scale-90 opacity-40 md:blur-[1px]' : 'opacity-0 scale-0'}`}>
                
                <div className="h-64 md:h-80 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
                   <img src={car.image} alt={car.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                   <div className="absolute top-4 right-4 z-20 bg-yellow-500 text-black px-3 py-1 text-xs font-black uppercase rounded tracking-widest shadow-lg">
                     {car.type}
                   </div>
                </div>

                <div className="p-6 md:p-8 relative z-20 -mt-10">
                   {car.badge && (
                      <div className="mb-2">
                         <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                            <Flame size={12} fill="currentColor" /> {car.badge}
                         </span>
                      </div>
                   )}
                   <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">{car.name}</h3>
                   <div className="flex flex-wrap gap-2 mb-6">
                      {car.specs.map((spec, s) => (
                        <span key={s} className="text-[10px] md:text-xs font-bold uppercase text-gray-300 bg-white/10 px-2 py-1 rounded border border-white/5">{spec}</span>
                      ))}
                   </div>
                   <p className="text-gray-400 text-sm mb-6 line-clamp-2">{car.desc}</p>
                   <button 
                    onClick={() => openBooking(car.name)} 
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-sm md:text-lg rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                     {t.book_btn} <Zap size={18} fill="black" />
                   </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-3 mt-4">
        {cars.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setActive(i)}
            className={`w-3 h-3 rounded-full transition-all ${active === i ? 'bg-yellow-500 w-8' : 'bg-gray-700 hover:bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

const VideoCarousel = ({ videos }) => {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [pausedVideo, setPausedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const minSwipeDistance = 50;

  const stopAllVideos = () => {
    Object.values(videoRefs.current).forEach(videoEl => {
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
    });
  };

  const scrollToVideo = (index) => {
    if (scrollContainerRef.current && index >= 0 && index < videos.length) {
      setIsScrolling(true);
      const videoWidth = 280 + 16; // width + gap
      const targetScroll = index * videoWidth;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      setCurrentIndex(index);
      
      setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    }
  };

  const next = () => {
    if (isScrolling) return;
    const nextIndex = Math.min(currentIndex + 1, videos.length - 1);
    if (nextIndex !== currentIndex) {
      scrollToVideo(nextIndex);
    }
  };

  const prev = () => {
    if (isScrolling) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      scrollToVideo(prevIndex);
    }
  };

  const onTouchStart = (e) => {
    if (isScrolling) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isScrolling) return;
    
    const distance = touchStart - touchEnd;
    const absDistance = Math.abs(distance);
    
    if (absDistance < minSwipeDistance) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const isLeftSwipe = distance > 0;
    const isRightSwipe = distance < 0;
    
    if (isLeftSwipe && currentIndex < videos.length - 1) {
      scrollToVideo(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      scrollToVideo(currentIndex - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      if (isScrolling) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const videoWidth = 280 + 16;
        const newIndex = Math.max(0, Math.min(Math.round(scrollLeft / videoWidth), videos.length - 1));
        
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isScrolling, videos.length]);

  const handlePlayPause = (video) => {
    const videoEl = videoRefs.current[video.id];
    if (!videoEl) return;

    // Если кликаем на уже играющее видео - пауза
    if (playingVideo === video.id) {
      videoEl.pause();
      setPlayingVideo(null);
      setPausedVideo(video.id);
      return;
    }

    // Останавливаем все остальные видео
    stopAllVideos();
    setPlayingVideo(null);
    setPausedVideo(null);

    // Запускаем выбранное видео
    setPlayingVideo(video.id);
    videoEl.currentTime = pausedVideo === video.id ? videoEl.currentTime : 0;
    videoEl.muted = false;
    videoEl.play().catch(e => console.log('Play error:', e));
  };

  const handleVideoLoadedMetadata = (videoId) => {
    const videoEl = videoRefs.current[videoId];
    if (videoEl && playingVideo !== videoId && pausedVideo !== videoId) {
      videoEl.currentTime = 0.1;
      videoEl.pause();
    }
  };

  const handleVideoEnd = () => {
    setPlayingVideo(null);
    setPausedVideo(null);
  };

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto px-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button 
        onClick={prev}
        className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/90 hover:bg-yellow-500 hover:text-black rounded-full border-2 border-yellow-500/50 transition-all backdrop-blur-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-110 hidden md:flex items-center justify-center"
      >
        <ChevronLeft size={28} />
      </button>
      <button 
        onClick={next}
        className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/90 hover:bg-yellow-500 hover:text-black rounded-full border-2 border-yellow-500/50 transition-all backdrop-blur-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-110 hidden md:flex items-center justify-center"
      >
        <ChevronRight size={28} />
      </button>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {videos.map((video, i) => {
          const isPlaying = playingVideo === video.id;
          const isPaused = pausedVideo === video.id;

          return (
            <div
              key={video.id}
              className="flex-shrink-0 w-[280px] snap-center"
            >
              <div 
                className="relative bg-gradient-to-b from-[#0a0a0a] to-black border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group hover:border-yellow-500/50 transition-all"
                onClick={() => handlePlayPause(video)}
              >
                <div className="relative bg-black" style={{ aspectRatio: '9/16' }}>
                  <video
                    ref={(el) => (videoRefs.current[video.id] = el)}
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    muted={!isPlaying}
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={() => handleVideoLoadedMetadata(video.id)}
                    onEnded={handleVideoEnd}
                  />
                  
                  {!isPlaying && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-20 h-20 md:w-24 md:h-24 bg-yellow-500 text-black rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(234,179,8,0.8)] ${isPaused ? 'opacity-80' : ''}`}>
                          <Play fill="currentColor" size={32} />
                        </div>
                      </div>
                    </>
                  )}

                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause(video);
                        }}
                      >
                        <div className="w-20 h-20 bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-6 bg-white rounded"></div>
                            <div className="w-1.5 h-6 bg-white rounded"></div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="absolute top-4 right-4 bg-black/90 text-white text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30">
                  {i + 1} / {videos.length}
                </div>

                {isPlaying && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ 
                          width: videoRefs.current[video.id] && videoRefs.current[video.id].duration
                            ? `${(videoRefs.current[video.id].currentTime / videoRefs.current[video.id].duration) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Navbar = ({ lang, setLang, toggleModal, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-xl border-yellow-500/20 py-3' : 'bg-transparent border-transparent py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
             <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-40 animate-pulse"></div>
             <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 w-full h-full rounded-xl flex items-center justify-center transform rotate-6 border border-yellow-300">
                <span className="text-black font-black text-2xl italic">K</span>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-[0.2em] text-lg leading-none">KORTÉGE</span>
            <span className="text-yellow-500 text-[10px] tracking-[0.4em] uppercase font-bold">{t.tagline}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 bg-black/40 px-8 py-2 rounded-full border border-white/5 backdrop-blur-sm">
          {Object.entries(t).slice(0, 4).map(([key, value]) => (
            <a key={key} href={`#${key}`} className="text-gray-400 hover:text-yellow-400 transition-colors text-xs uppercase tracking-widest font-bold hover:shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              {value}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-2 text-white/70 hover:text-white uppercase font-bold text-xs bg-white/5 px-3 py-2 rounded-lg border ${langMenuOpen ? 'border-yellow-500 text-white' : 'border-white/10'}`}
            >
              <Globe size={14} /> {LANGUAGES[lang].short}
            </button>
            
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-yellow-600/30 rounded-lg p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                 {Object.keys(LANGUAGES).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => { setLang(l); setLangMenuOpen(false); }} 
                    className="flex items-center gap-3 w-full text-left px-3 py-3 text-gray-300 hover:text-yellow-400 text-xs hover:bg-white/10 rounded transition-all mb-1 last:mb-0 font-bold uppercase"
                  >
                    <span className="text-lg">{LANGUAGES[l].flag}</span> {LANGUAGES[l].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => toggleModal()} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2">
            <Zap size={14} fill="black" /> {t.book}
          </button>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white bg-white/10 p-2 rounded-lg backdrop-blur-md">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full h-screen bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-8 z-50 animate-in fade-in slide-in-from-top-5">
          <div className="flex flex-col gap-6">
            {Object.entries(t).slice(0, 4).map(([key, value]) => (
              <a key={key} href={`#${key}`} onClick={() => setIsOpen(false)} className="text-3xl text-white font-black uppercase tracking-tight flex items-center justify-between border-b border-white/10 pb-4">
                {value} <ChevronRight className="text-yellow-500" />
              </a>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(LANGUAGES).map((l) => (
               <button 
                  key={l} 
                  onClick={() => setLang(l)} 
                  className={`py-3 px-4 text-sm border rounded-xl font-bold flex items-center gap-3 ${lang === l ? 'border-yellow-500 text-black bg-yellow-500' : 'border-white/10 text-gray-400 bg-white/5'}`}
                >
                  <span className="text-2xl">{LANGUAGES[l].flag}</span>
                  <div className="flex flex-col text-left">
                     <span>{LANGUAGES[l].short}</span>
                     <span className="text-[10px] opacity-70 font-normal">{LANGUAGES[l].label}</span>
                  </div>
                </button>
            ))}
          </div>
          <button onClick={() => {toggleModal(); setIsOpen(false)}} className="w-full bg-yellow-500 py-6 text-black font-black uppercase text-xl rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)]">
             {t.book}
          </button>
        </div>
      )}
    </nav>
  );
};

const Modal = React.memo(({ isOpen, close, lang, selectedCar, carList }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', fromTo: '', car: selectedCar || '' });
  const [isSent, setIsSent] = useState(false);
  const t = content[lang].form;

  useEffect(() => {
    if(selectedCar) setFormData(prev => ({...prev, car: selectedCar}));
  }, [selectedCar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        close();
        setFormData({ name: '', phone: '', date: '', fromTo: '', car: '' });
      }, 3000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95" onClick={close}></div>
      <div className="bg-[#0f0f0f] border border-yellow-500/30 w-full max-w-lg rounded-3xl p-4 md:p-8 relative shadow-[0_0_100px_rgba(234,179,8,0.15)] overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-500/10 rounded-full opacity-50"></div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            close();
          }} 
          className="absolute top-3 right-3 md:top-6 md:right-6 text-gray-500 hover:text-white active:text-white transition-colors bg-white/10 hover:bg-white/20 active:bg-white/30 p-3 md:p-2 rounded-full z-50 touch-manipulation"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={24} className="md:w-5 md:h-5" strokeWidth={2.5}/>
        </button>
        
        {isSent ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
               <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
            <h3 className="text-3xl text-white font-black mb-2 uppercase italic">Success!</h3>
            <p className="text-gray-400">{t.success}</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase italic tracking-wide pt-2 md:pt-0 pr-12 md:pr-0">{t.title}</h2>
            <p className="text-gray-500 mb-6 md:mb-8 text-sm">Заполните данные для начала миссии.</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
              <div className="group">
                <input 
                  required
                  type="text" 
                  placeholder={t.name}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all focus:bg-white/5 placeholder:text-gray-600"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <input 
                required
                type="text" 
                placeholder={t.phone}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all focus:bg-white/5 placeholder:text-gray-600"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all focus:bg-white/5 text-sm"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
                 <select 
                  className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all focus:bg-white/5 text-sm appearance-none"
                  value={formData.car}
                  onChange={e => setFormData({...formData, car: e.target.value})}
                >
                  <option value="" className="bg-black text-gray-500">{t.car}</option>
                  {carList.map(c => <option key={c.id} value={c.name} className="bg-black">{c.name}</option>)}
                </select>
              </div>
              <textarea 
                placeholder={t.route}
                className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all focus:bg-white/5 h-28 resize-none placeholder:text-gray-600"
                value={formData.fromTo}
                onChange={e => setFormData({...formData, fromTo: e.target.value})}
              ></textarea>
             
              <button type="submit" className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase p-5 rounded-xl transition-all shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] hover:scale-[1.02] flex justify-center items-center gap-2">
                {t.submit} <ChevronRight size={20} strokeWidth={3} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
});

const VideoModal = ({ isOpen, close, videoUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300">
      <button onClick={close} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full z-50">
        <X size={30} />
      </button>
      <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.2)] border border-white/10 relative">
        {videoUrl ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Video not found</div>
        )}
      </div>
    </div>
  );
};

const InfoModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-2xl rounded-3xl p-8 md:p-10 relative shadow-[0_0_100px_rgba(234,179,8,0.1)] overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-20"><X size={20}/></button>
        
        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-yellow-500" size={32} />
          {title}
        </h2>
        
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            {content.map((paragraph, idx) => (
              <p key={idx} className="text-gray-300 leading-relaxed text-sm md:text-base border-l-2 border-yellow-500/30 pl-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
           <button onClick={onClose} className="text-sm font-bold text-yellow-500 uppercase hover:text-white transition-colors">
             Close / Закрыть
           </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('ru');
  const [currency, setCurrency] = useState('USD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarForModal, setSelectedCarForModal] = useState('');
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: null });
  const [infoModal, setInfoModal] = useState({ isOpen: false, type: null });
  const [availableVideos, setAvailableVideos] = useState([]);

  const t = content[lang];
  const rate = EXCHANGE_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];

  const convertPrice = (usd) => Math.round(usd * rate);

  const openBooking = (carName = '') => {
    setSelectedCarForModal(carName);
    setIsModalOpen(true);
  };

  const openVideo = (url) => {
    setVideoModal({ isOpen: true, url });
  };

  const openInfo = (type) => {
    setInfoModal({ isOpen: true, type });
  };

  const getTranslatedCars = useMemo(() => {
    return CARS.map(car => ({
      ...car,
      ...t.fleet.cars[car.key]
    }));
  }, [t.fleet.cars]);

  // Загрузка списка существующих видео
  useEffect(() => {
    const loadVideos = async () => {
      const videos = [];
      const maxCheck = 20;
      
      for (let i = 1; i <= maxCheck; i++) {
        const videoUrl = `/video/${i}.mp4`;
        const exists = await checkVideoExists(videoUrl);
        if (exists) {
          videos.push({
            id: i,
            videoUrl: videoUrl
          });
        }
      }
      
      setAvailableVideos(videos);
    };
    
    loadVideos();
  }, []);

  useEffect(() => {
    const meta = content[lang].meta;
    
    // Update document title
    document.title = meta.title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', meta.description);
    
    // Update html lang attribute
    document.documentElement.lang = lang;
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', meta.title);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', meta.description);
  }, [lang]);

  return (
    <>
      <style>{styles}</style>
      <div className="bg-[#050505] min-h-screen text-gray-200 font-sans selection:bg-yellow-500 selection:text-black overflow-x-hidden relative">
        
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-black"></div>
        <div className="bg-grain"></div>
        <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)] opacity-20 pointer-events-none"></div>

        <Navbar lang={lang} setLang={setLang} toggleModal={() => openBooking()} t={t.nav} />
        <Modal isOpen={isModalOpen} close={() => setIsModalOpen(false)} lang={lang} selectedCar={selectedCarForModal} carList={getTranslatedCars} />
        <VideoModal isOpen={videoModal.isOpen} close={() => setVideoModal({ isOpen: false, url: null })} videoUrl={videoModal.url} />
        
        <InfoModal 
          isOpen={infoModal.isOpen} 
          onClose={() => setInfoModal({ isOpen: false, type: null })}
          title={infoModal.type === 'privacy' ? t.legal.privacy_title : t.legal.terms_title}
          content={infoModal.type === 'privacy' ? t.legal.privacy_text : t.legal.terms_text}
        />
        
        <FloatingContacts openBooking={openBooking} />

        <div className="relative z-10">
          
          <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse-glow"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px]"></div>

            <div className="container mx-auto text-center relative pt-20">
              <div className="inline-flex items-center gap-2 border border-yellow-500/30 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full mb-8 animate-float">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                <span className="text-yellow-400 font-bold tracking-widest text-xs uppercase">{t.hero.badge}</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.85] mb-8 mix-blend-overlay opacity-90 select-none">
                KOR<span className="text-yellow-500">TÉGE</span>
              </h1>
              
              <div className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight mb-8">
                {t.hero.subtitle}
              </div>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                {t.hero.desc}
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <button onClick={() => openBooking()} className="group relative px-10 py-5 bg-yellow-500 text-black font-black text-lg uppercase tracking-wider overflow-hidden rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.4)]">
                  <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center gap-3">{t.hero.cta} <ChevronRight strokeWidth={4} /></span>
                </button>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
               <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
               <div className="w-px h-12 bg-gradient-to-b from-yellow-500 to-transparent"></div>
            </div>
          </section>

          <RunningText text={t.marquee} />

          <section id="risks" className="py-32 relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-transparent"></div>
            
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-12 uppercase leading-none tracking-tight">
                    {t.risks.title} <span className="text-red-600 animate-pulse">!</span>
                  </h2>
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="glass-card p-6 rounded-2xl flex gap-6 group hover:-translate-x-2 transition-transform duration-300 cursor-default">
                        <div className="mt-2">
                           <AlertTriangle className="text-red-500 w-8 h-8 opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{t.risks[`pain${num}_title`]}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed">{t.risks[`pain${num}_desc`]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-[#0a0a0a] border border-yellow-500/20 rounded-3xl p-10 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
                    
                    <h3 className="text-3xl font-black text-yellow-500 mb-10 uppercase tracking-widest">{t.risks.sol_title}</h3>
                    
                    <ul className="space-y-8 relative z-10">
                      {[1, 2, 3].map((num) => (
                        <li key={num} className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center border border-yellow-500/30">
                             <Shield className="text-yellow-500 w-6 h-6" />
                          </div>
                          <span className="text-lg text-white font-bold">{t.risks[`sol${num}`]}</span>
                        </li>
                      ))}
                    </ul>

                    <button onClick={() => openBooking()} className="mt-12 w-full py-5 bg-white/5 border border-yellow-500/30 text-yellow-500 font-black tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-all rounded-xl">
                      {t.risks.btn}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="fleet" className="py-20 relative overflow-hidden">
             <div className="container mx-auto px-4 mb-10">
              <div className="flex flex-col items-center text-center">
                <span className="text-yellow-500 text-xs tracking-[0.5em] uppercase font-bold mb-4">{t.fleet.subtitle}</span>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight">{t.fleet.title}</h2>
              </div>
            </div>
            
            <CarCarousel cars={getTranslatedCars} t={t.fleet} openBooking={openBooking} />
          </section>

          <section className="py-20 relative border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <span className="text-yellow-500 text-xs tracking-[0.5em] uppercase font-bold mb-4">Workflow</span>
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">{t.process.title}</h2>
                  <p className="text-gray-400 mt-4 max-w-xl mx-auto">{t.process.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                   <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent -z-10"></div>

                   {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex flex-col items-center text-center group">
                         <div className="w-24 h-24 rounded-full bg-[#0a0a0a] border border-yellow-500/30 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-yellow-500 transition-colors">
                            {step === 1 && <CheckSquare size={32} className="text-yellow-500" />}
                            {step === 2 && <Phone size={32} className="text-yellow-500" />}
                            {step === 3 && <Car size={32} className="text-yellow-500" />}
                            {step === 4 && <ShieldCheck size={32} className="text-yellow-500" />}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-black font-black text-xs border-4 border-[#0a0a0a]">
                               {step}
                            </div>
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2 uppercase">{t.process[`step${step}_title`]}</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">{t.process[`step${step}_desc`]}</p>
                      </div>
                   ))}
                </div>
            </div>
          </section>

          <section className="py-16 relative border-t border-white/5 bg-black/50">
             <div className="container mx-auto px-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center group">
                       <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                         {t.stats[`s${s}_val`]}
                       </div>
                       <div className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                         {t.stats[`s${s}_label`]}
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </section>

          <section id="rates" className="py-32 relative border-t border-white/5">
             <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8 max-w-5xl mx-auto">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-none mb-2">{t.routes.title}</h2>
                  <p className="text-gray-400 text-sm">{t.routes.note}</p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.routes.subtitle}</span>
                   <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
                      {Object.keys(EXCHANGE_RATES).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === c ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-3">
                {ROUTE_DEFINITIONS.map((route, i) => (
                  <div 
                    key={i} 
                    onClick={() => openBooking()}
                    className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-yellow-500/50 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 relative z-10">
                      <span className="text-white font-bold text-lg">{t.cities[route.from]}</span>
                      <ArrowRight size={16} className="text-yellow-500 hidden md:block" />
                      <span className="text-gray-500 text-xs md:hidden">to</span>
                      <span className="text-white font-bold text-lg">{t.cities[route.to]}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="text-right">
                          <span className="block text-[10px] text-gray-600 uppercase font-bold">{t.routes.start_at}</span>
                          <span className="text-xl font-mono font-bold text-yellow-500">{convertPrice(route.priceUSD)}{symbol}</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                          <ChevronRight size={16} />
                       </div>
                    </div>
                  </div>
                ))}
                
                <div onClick={() => openBooking()} className="md:col-span-2 bg-gradient-to-r from-yellow-900/20 to-black border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-yellow-500/50 transition-all group mt-2">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold uppercase text-sm">{t.routes.custom_title}</h3>
                        <p className="text-gray-500 text-xs">{t.routes.custom_desc}</p>
                      </div>
                   </div>
                   <button className="bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider group-hover:bg-white transition-colors">
                     {t.routes.custom_btn}
                   </button>
                </div>
              </div>
            </div>
          </section>

           <section className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase text-center mb-20">{t.reviews.title}</h2>
              <VideoCarousel videos={availableVideos} />
            </div>
          </section>

          <section id="faq" className="py-24 relative bg-black/50 border-t border-white/5">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <span className="text-yellow-500 text-xs tracking-[0.5em] uppercase font-bold mb-4">{t.faq.subtitle}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{t.faq.title}</h2>
               </div>
               <FAQ t={t.faq} />
            </div>
          </section>

          <section id="contact" className="py-40 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/10 via-transparent to-transparent"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase mb-12 leading-none">
                {t.contact.title_pre} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">{t.contact.title_accent}</span>
              </h2>
              
              <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-16">
                 <button onClick={() => openBooking()} className="bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-black py-6 px-16 rounded-2xl transition-all shadow-[0_0_50px_rgba(234,179,8,0.4)] hover:shadow-[0_0_80px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95">
                    {t.contact.btn}
                 </button>
                 <div className="flex gap-4">
                    <a href="https://t.me/+380756953174" target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-[#0088cc] rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg border border-white/10">
                      <Navigation size={28} />
                    </a>
                    <a href="tel:+380756953174" className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg border border-white/10">
                      <Phone size={28} />
                    </a>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-6 border-t border-white/10 pt-10 max-w-4xl mx-auto">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{t.contact.payment}</span>
                 <div className="flex gap-8 text-gray-400">
                    <div className="flex flex-col items-center gap-2 group">
                       <Bitcoin size={32} className="group-hover:text-yellow-500 transition-colors" />
                       <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Crypto</span>
                    </div>
                     <div className="flex flex-col items-center gap-2 group">
                       <Briefcase size={32} className="group-hover:text-yellow-500 transition-colors" />
                       <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Invoice</span>
                    </div>
                     <div className="flex flex-col items-center gap-2 group">
                       <CreditCard size={32} className="group-hover:text-yellow-500 transition-colors" />
                       <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Card</span>
                    </div>
                     <div className="flex flex-col items-center gap-2 group">
                       <DollarSign size={32} className="group-hover:text-yellow-500 transition-colors" />
                       <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Cash</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-16 flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                {t.contact.cities.map((city, index) => (
                  <React.Fragment key={index}>
                    <span>{city}</span>
                    {index < t.contact.cities.length - 1 && <span className="text-yellow-500">•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-12 border-t border-white/5 text-center relative z-10 bg-black">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="text-2xl font-black text-white tracking-widest">K<span className="text-yellow-500">T</span></span>
                <p className="text-gray-600 text-xs">© 2025 KORTÉGE FUTURE MOBILITY. {t.footer.rights}</p>
                <div className="flex gap-4 text-gray-500 text-xs font-bold uppercase">
                  <button onClick={() => openInfo('privacy')} className="hover:text-yellow-500 transition-colors">{t.footer.privacy}</button>
                  <button onClick={() => openInfo('terms')} className="hover:text-yellow-500 transition-colors">{t.footer.terms}</button>
                </div>
              </div>
            </div>
          </footer>
        
        </div>
      </div>
    </>
  );
};

export default App;
