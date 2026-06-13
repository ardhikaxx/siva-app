const fs = require('fs');
const path = require('path');

const categories = ["Mitos & Fakta", "Tips Nyeri", "Gizi & Diet", "Fase Siklus", "Kesehatan Seksual", "Kesehatan Mental", "Hormon", "Produktivitas", "Perawatan Diri"];

const subjects = ["Nyeri Haid", "Kram Perut", "Jerawat Hormonal", "Sakit Kepala", "Kelelahan", "Mood Swing", "Perut Kembung", "PMS", "Payudara Sensitif", "Dehidrasi", "Siklus Tidak Teratur", "Darah Haid", "Keputihan", "Ovulasi", "PCOS", "Endometriosis", "Kesehatan Rahim", "Menopause Dini", "Kehamilan", "Kesuburan", "Diet Sehat", "Olahraga", "Tidur yang Berkualitas"];

const actions = ["Cara Meredakan", "Rahasia Mengatasi", "Mitos Seputar", "Fakta Mengejutkan Tentang", "Mengapa Anda Mengalami", "Penyebab Terjadinya", "Hubungan Antara Diet dan", "Mengenal Lebih Dalam", "Kaitan Stres dengan", "Panduan Lengkap Menghadapi", "Pengaruh Kafein terhadap", "Peran Zat Besi dalam", "Pengaruh Kurang Tidur pada", "Pentingnya Menjaga"];

const templates = [
  "Banyak wanita tidak menyadari bahwa {subject} sangat dipengaruhi oleh gaya hidup. {action} {subject} dapat dimulai dengan hal sederhana. Penelitian medis menunjukkan bahwa perubahan kecil dapat membawa dampak besar. Jika Anda sering mengalaminya, pastikan tubuh tetap terhidrasi dan cukup istirahat.",
  "Ini adalah fakta medis yang harus diketahui semua wanita. {action} {subject} bukanlah hal yang mustahil. Dengan pemahaman yang benar tentang hormon Anda, {subject} bisa dikendalikan. Konsultasikan dengan dokter jika gejala memburuk, tetapi secara umum, ini sangat normal terjadi pada berbagai fase.",
  "Tahukah Anda? {subject} seringkali hanya mitos belaka jika dikaitkan dengan hal-hal yang tidak logis. Secara klinis, {action} {subject} membutuhkan pendekatan nutrisi dan kesabaran. Perbanyak sayuran hijau dan hindari gula berlebih untuk melihat perubahan drastis.",
  "Fase siklus sangat menentukan bagaimana tubuh bereaksi. {subject} biasanya memuncak saat estrogen atau progesteron berfluktuasi tajam. {action} {subject} secara alami adalah dengan mendengarkan tubuh Anda, melakukan peregangan ringan, dan kompres hangat.",
  "Banyak yang bertanya tentang {subject}. Para ahli ginekologi sepakat bahwa {action} {subject} berkaitan erat dengan tingkat stres kortisol di otak. Cobalah latihan pernapasan atau yoga untuk meredakan ketegangan tubuh."
];

const generatedArticles = [];

let idCounter = 1;

for (let i = 0; i < 1000; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const template = templates[Math.floor(Math.random() * templates.length)];

  const title = `${action} ${subject} #${i + 1}`;
  let content = template.replace(/{subject}/g, subject).replace(/{action}/g, action);
  
  // Adding some random variations to make them slightly more unique
  content += ` Fakta nomor ${i + 1}: Tubuh setiap wanita unik, jadi teruslah memantau jurnal SIVA Anda!`;
  
  const readTime = `${Math.floor(Math.random() * 4) + 1} Min`;

  generatedArticles.push({
    id: idCounter++,
    category,
    title,
    content,
    readTime
  });
}

const outputPath = path.join(__dirname, '..', 'data', 'articles.json');
fs.writeFileSync(outputPath, JSON.stringify(generatedArticles, null, 2));

console.log(`Successfully generated ${generatedArticles.length} articles!`);
