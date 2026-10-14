// Demo catalog. Instruction bodies live in ../content/<instruction id>.md.
//
// Every training uses the same sandbox image (vm-image/), which can run .sql
// files against the w3schools sample database, .py files with python3 and
// .js files with node, and exposes a bash terminal.

const categories = [
  { name: "Web Development", description: "Learn to build web applications" },
  { name: "Data Science", description: "Explore data analysis and machine learning" },
  { name: "Cybersecurity", description: "Understand security principles and practices" },
  { name: "Database Management", description: "Learn about database design and SQL" },
];

const trainings = [
  {
    id: "web-dev-101",
    name: "Web Development 101",
    slug: "web-development-101",
    category: "Web Development",
    image_file_path: "images/web-dev-101.jpg",
    description:
      "HTML ile sayfa iskeleti kurmayı ve JavaScript ile ilk programlarınızı yazmayı öğrenin.",
    level: "beginner",
    estimated_minutes: 90,
    chapters: [
      {
        id: "web-dev-101-chapter-1",
        name: "HTML'e Giriş",
        description: "Web'in çalışma mantığı ve HTML belgesinin yapısı",
        instructions: [
          { id: "web101-ch1-how-web-works", name: "Web nasıl çalışır?" },
          { id: "web101-ch1-html-structure", name: "HTML belgesinin yapısı" },
          {
            id: "web101-ch1-common-tags",
            name: "Sık kullanılan etiketler",
            achievement: {
              id: "web101-html-builder",
              name: "HTML İnşaatçısı",
              description: "HTML'in temel etiketlerini öğrendiniz.",
              icon: "code",
              points: 10,
            },
          },
        ],
      },
      {
        id: "web-dev-101-chapter-2",
        name: "JavaScript Temelleri",
        description: "Değişkenler, fonksiyonlar, diziler ve döngüler",
        instructions: [
          { id: "web101-ch2-variables", name: "Değişkenler ve veri tipleri" },
          { id: "web101-ch2-functions", name: "Fonksiyonlar" },
          {
            id: "web101-ch2-arrays-loops",
            name: "Diziler ve döngüler",
            achievement: {
              id: "web101-js-explorer",
              name: "JavaScript Kaşifi",
              description: "İlk JavaScript programlarınızı çalıştırdınız.",
              icon: "brand-javascript",
              points: 20,
            },
          },
        ],
      },
    ],
  },
  {
    id: "data-science-101",
    name: "Data Science 101",
    slug: "data-science-101",
    category: "Data Science",
    image_file_path: "images/data-science-101.jpg",
    description:
      "Python ile veri bilimine ilk adım: değişkenler, listeler, döngüler ve temel istatistikler.",
    level: "beginner",
    estimated_minutes: 120,
    chapters: [
      {
        id: "data-science-101-chapter-1",
        name: "Python'a Giriş",
        description: "Python sözdizimi, listeler ve fonksiyonlar",
        instructions: [
          { id: "ds101-ch1-why-python", name: "Neden Python?" },
          { id: "ds101-ch1-variables-lists", name: "Değişkenler ve listeler" },
          {
            id: "ds101-ch1-loops-functions",
            name: "Döngüler ve fonksiyonlar",
            achievement: {
              id: "ds101-first-script",
              name: "İlk Betik",
              description: "İlk Python betiğinizi yazıp çalıştırdınız.",
              icon: "brand-python",
              points: 10,
            },
          },
        ],
      },
      {
        id: "data-science-101-chapter-2",
        name: "Veriyle Çalışmak",
        description: "Özet istatistikler, gruplama ve filtreleme",
        instructions: [
          { id: "ds101-ch2-statistics", name: "Temel istatistikler" },
          { id: "ds101-ch2-dictionaries", name: "Sözlüklerle gruplama" },
          {
            id: "ds101-ch2-comprehensions",
            name: "Liste üreteçleriyle filtreleme",
            achievement: {
              id: "ds101-data-wrangler",
              name: "Veri Düzenleyici",
              description: "Ham veriyi özetleyip anlamlı sonuçlar çıkardınız.",
              icon: "chart-bar",
              points: 20,
            },
          },
        ],
      },
    ],
  },
  {
    id: "cybersecurity-101",
    name: "Cybersecurity 101",
    slug: "cybersecurity-101",
    category: "Cybersecurity",
    image_file_path: "images/cybersecurity-101.jpg",
    description:
      "Ağ temelleri, Linux komut satırı ve dosya izinleriyle siber güvenliğin temellerini keşfedin.",
    level: "beginner",
    estimated_minutes: 90,
    chapters: [
      {
        id: "cybersecurity-101-chapter-1",
        name: "Ağ Temelleri",
        description: "IP adresleri, portlar ve DNS",
        instructions: [
          { id: "cs101-ch1-ip-and-ports", name: "IP adresleri ve portlar" },
          { id: "cs101-ch1-network-commands", name: "Terminalde ağ komutları" },
          {
            id: "cs101-ch1-dns",
            name: "DNS ve isim çözümleme",
            achievement: {
              id: "cs101-network-explorer",
              name: "Ağ Kaşifi",
              description: "Bir makinenin ağ yapılandırmasını incelediniz.",
              icon: "network",
              points: 10,
            },
          },
        ],
      },
      {
        id: "cybersecurity-101-chapter-2",
        name: "Linux Güvenliğine Giriş",
        description: "Kullanıcılar, dosya izinleri ve parola özetleri",
        instructions: [
          { id: "cs101-ch2-users", name: "Kullanıcılar ve gruplar" },
          { id: "cs101-ch2-permissions", name: "Dosya izinleri" },
          {
            id: "cs101-ch2-hashing",
            name: "Parolalar ve özet fonksiyonları",
            achievement: {
              id: "cs101-security-aware",
              name: "Güvenlik Bilinci",
              description: "İzinler ve parola özetleri hakkında temel bilgiyi edindiniz.",
              icon: "shield-lock",
              points: 20,
            },
          },
        ],
      },
    ],
  },
  {
    id: "database-management-101",
    name: "Database Management 101",
    slug: "database-management-101",
    category: "Database Management",
    image_file_path: "images/database-management-101.jpg",
    description:
      "SQL ile veritabanlarını sorgulamayı gerçek bir örnek veritabanı üzerinde uygulamalı olarak öğrenin.",
    level: "beginner",
    estimated_minutes: 150,
    chapters: [
      {
        id: "database-management-101-chapter-1",
        name: "SQL'e Giriş",
        description: "Veritabanı kavramları ve ilk SELECT sorguları",
        instructions: [
          { id: "db101-ch1-what-is-sql", name: "SQL nedir?" },
          {
            id: "db101-ch1-first-query",
            name: "İlk sorgunuz",
            achievement: {
              id: "db101-first-query",
              name: "İlk Sorgu",
              description: "İlk SQL sorgunuzu çalıştırdınız.",
              icon: "database",
              points: 10,
            },
          },
          { id: "db101-ch1-select-columns", name: "Belirli sütunları seçmek" },
          { id: "db101-ch1-distinct", name: "Tekrarsız değerler: DISTINCT" },
        ],
      },
      {
        id: "database-management-101-chapter-2",
        name: "Filtreleme ve Sıralama",
        description: "WHERE, mantıksal operatörler, ORDER BY ve LIKE",
        instructions: [
          { id: "db101-ch2-where", name: "WHERE ile filtreleme" },
          { id: "db101-ch2-and-or-not", name: "AND, OR ve NOT" },
          { id: "db101-ch2-order-by-limit", name: "ORDER BY ve LIMIT" },
          {
            id: "db101-ch2-like",
            name: "LIKE ile desen arama",
            achievement: {
              id: "db101-filter-master",
              name: "Filtre Ustası",
              description: "Verileri istediğiniz gibi süzüp sıraladınız.",
              icon: "filter",
              points: 20,
            },
          },
        ],
      },
      {
        id: "database-management-101-chapter-3",
        name: "Gruplama ve Tablo Birleştirme",
        description: "Toplama fonksiyonları, GROUP BY ve JOIN",
        instructions: [
          { id: "db101-ch3-aggregates", name: "Toplama fonksiyonları" },
          { id: "db101-ch3-group-by", name: "GROUP BY ve HAVING" },
          { id: "db101-ch3-inner-join", name: "INNER JOIN" },
          {
            id: "db101-ch3-left-join",
            name: "LEFT JOIN",
            achievement: {
              id: "db101-join-expert",
              name: "Birleştirme Uzmanı",
              description: "Birden fazla tabloyu tek sorguda birleştirdiniz.",
              icon: "link",
              points: 30,
            },
          },
        ],
      },
    ],
  },
];

module.exports = { categories, trainings };
