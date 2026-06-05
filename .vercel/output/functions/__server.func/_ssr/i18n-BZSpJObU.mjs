const az = {
  // Nav
  nav: {
    panel: "Panel",
    sessions: "Sifarişlər və Sessiyalar",
    menu: "Menyu",
    tablesQr: "Masalar və QR",
    waiters: "Ofisiantlar",
    pdf: "PDF Menyu",
    analytics: "Analitika",
    settings: "Ayarlar",
    plan: "Plan",
    support: "Dəstək",
    waiterView: "Ofisiant ekranı",
    signOut: "Çıxış",
    role: "Rol",
    restaurant: "Restoran"
  },
  waiterNav: {
    newOrders: "Yeni sifarişlər",
    myTables: "Mənim masalarım",
    openSessions: "Açıq sessiyalar",
    freeTables: "Boş masalar",
    notifications: "Bildirişlər"
  },
  // Common
  common: {
    save: "Yadda saxla",
    cancel: "Ləğv et",
    delete: "Sil",
    edit: "Redaktə et",
    add: "Əlavə et",
    confirm: "Təsdiqlə",
    close: "Bağla",
    loading: "Yüklənir…",
    empty: "Məlumat yoxdur",
    error: "Xəta baş verdi",
    back: "Geri",
    continue: "Davam et",
    search: "Axtarış",
    yes: "Bəli",
    no: "Xeyr",
    actions: "Əməliyyatlar",
    total: "Cəmi",
    quantity: "Say",
    price: "Qiymət",
    note: "Qeyd",
    status: "Status",
    today: "Bu gün",
    yesterday: "Dünən",
    thisMonth: "Bu ay",
    custom: "Seçim"
  },
  // Auth
  auth: {
    welcomeBack: "Yenidən xoş gəlmisiniz",
    signInSubtitle: "Restoranınızı idarə etmək üçün daxil olun.",
    email: "E-poçt",
    password: "Şifrə",
    forgot: "Şifrəni unutdunuz?",
    signIn: "Daxil ol",
    signingIn: "Daxil olunur…",
    signInWithGoogle: "Google ilə daxil ol",
    or: "və ya e-poçt ilə",
    newToMasaQr: "MasaQR-a yenisiniz?",
    startTrial: "Pulsuz sınaq müddətini başladın",
    joining: "Komandaya qoşulmaq?",
    useInvite: "Dəvət kodundan istifadə edin",
    googleNotEnabled: "Google ilə daxilolma hələ aktiv deyil. E-poçt və şifrədən istifadə edin.",
    noProfile: "Bu hesab üçün profil tapılmadı. Restoran rəhbərinizlə əlaqə saxlayın.",
    signInFailed: "Daxilolma uğursuz oldu",
    register: {
      badge: "30 gün pulsuz",
      heading: "Restoranınızı bir neçə dəqiqəyə onlayn edin.",
      subhead: "Kart tələb olunmur. Tam funksionallıq. İstənilən vaxt ləğv edin.",
      yourName: "Adınız",
      restaurantName: "Restoran adı",
      slugLabel: "URL ünvanı",
      submit: "Sınağı başlat",
      already: "Artıq hesabınız var?",
      passwordMin: "Ən az 8 simvol",
      features: [
        "3 dildə tam QR menyu",
        "Limitsiz PDF ixracı",
        "Ofisiant bildirişləri və masa sessiyaları",
        "Sınaq müddətində 3 filiala qədər",
        "İstənilən vaxt bizə yazın"
      ],
      success: "Sınaq müddəti başladı! Quraşdırmaya keçirik."
    },
    join: {
      title: "Komandaya qoşul",
      subtitle: "Restoran rəhbərindən aldığınız dəvət kodunu daxil edin.",
      code: "Dəvət kodu",
      yourName: "Adınız",
      password: "Şifrə yarat",
      submit: "Komandaya qoşul",
      joining: "Qoşulunur…",
      invalid: "Kod düzgün deyil və ya vaxtı keçib",
      welcome: (n) => `Xoş gəlmisiniz, ${n}`,
      already: "Komandadasınız?",
      signIn: "Daxil ol"
    }
  },
  // Roles
  roles: {
    manager: "Menecer",
    waiter: "Ofisiant",
    owner: "Sahib"
  },
  // Tables
  tableStatus: {
    available: "Boş",
    occupied: "Dolu",
    reserved: "Rezerv",
    disabled: "Deaktiv"
  },
  // Order statuses (simplified)
  orderStatus: {
    pending_waiter: "Ofisiant gözləyir",
    confirmed: "Təsdiqləndi",
    served: "Verildi",
    cancelled: "Ləğv edildi"
  },
  // Kitchen deactivated
  kitchenDeactivated: {
    title: "Bu bölmə deaktiv edilib",
    body: "MasaQR artıq mətbəx iş axınını idarə etmir. Sifarişlər birbaşa ofisiant ekranında görünür.",
    goWaiter: "Ofisiant ekranına keç",
    goDashboard: "Panelə qayıt"
  }
};
const T = az;
export {
  T
};
