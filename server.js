const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middlewares
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Allowed for embedded demo preview frames and external assets
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// MULTER - Image Upload Configuration
// ==========================================
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeName = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    cb(null, safeName);
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Chỉ cho phép file ảnh: JPG, PNG, WEBP, GIF'), false);
};

const upload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Database - Mock Users Database for Authentication & RBAC
const usersData = [
  {
    id: 'usr-admin-01',
    fullName: 'Quản Trị Viên LinaDesign',
    email: 'admin@linadesign.vn',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'usr-client-02',
    fullName: 'Nguyễn Văn Minh',
    email: 'user@gmail.com',
    password: 'user123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    createdAt: '2026-09-15T00:00:00.000Z'
  }
];

// Database - Mock Database of WordPress Themes
const themesData = [
  {
    id: 'lina-shop-pro',
    name: 'LinaShop Pro',
    slug: 'linashop-pro',
    subtitle: 'Theme E-Commerce Thời Trang & Điện Máy Đa Năng Tốc Độ Cao',
    category: 'E-Commerce',
    builder: 'Elementor Pro',
    version: 'v3.8.4',
    updatedDate: '25/09/2026',
    price: 499000,
    originalPrice: 899000,
    salesCount: 1420,
    rating: 4.9,
    ratingCount: 184,
    badge: 'Bán chạy nhất',
    badgeColor: 'cyan',
    image: '/images/theme-linashop.jpg',
    demoUrl: 'https://linadesign.vn/demo/linashop-pro',
    pageSpeed: 99,
    description: 'LinaShop Pro là giải pháp theme WordPress bán hàng chuyên nghiệp hàng đầu với khả năng tối ưu hóa tốc độ chuẩn Google PageSpeed 99+. Tích hợp WooCommerce nâng cao, Ajax Filter sản phẩm siêu tốc, biến thể màu sắc/kích thước, và checkout 1 bước tối ưu tỷ lệ chuyển đổi.',
    features: [
      'Tích hợp WooCommerce 8.x + Elementor Pro Builder',
      'Bộ lọc Ajax siêu nhanh (Bộ lọc màu sắc, giá, thuộc tính, thương hiệu)',
      'Tốc độ tải trang dưới 0.8 giây, chuẩn Google Core Web Vitals',
      'Đầy đủ Mega Menu linh hoạt, xem nhanh sản phẩm (Quick View)',
      'Hỗ trợ Đa tiền tệ, Đa ngôn ngữ (WPML / Polylang ready)',
      'Giao diện Mobile app view tùy biến riêng cho điện thoại',
      'Đã kèm bản quyền trọn đời & hỗ trợ Cập nhật 1-Click tự động'
    ],
    compatibility: ['WooCommerce 8.x+', 'Elementor Pro', 'Gutenberg', 'WPML', 'Yoast SEO', 'RankMath'],
    reviews: [
      { author: 'Trần Minh Anh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 5, date: '20/09/2026', comment: 'Giao diện cực kỳ đẹp và load rất nhanh! Khách hàng của mình rất thích giao diện mua hàng 1 bước. Support nhiệt tình 10/10.' },
      { author: 'Lê Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', rating: 5, date: '15/09/2026', comment: 'Giao diện linh hoạt, Elementor kéo thả rất thích. Đã mua 3 license cho 3 shop thời trang của công ty.' }
    ]
  },
  {
    id: 'lina-agency-ultra',
    name: 'LinaAgency Ultra',
    slug: 'linaagency-ultra',
    subtitle: 'Theme Công Ty, SaaS, Agency Sáng Tạo & Startup Công Nghệ',
    category: 'Agency & Tech',
    builder: 'Elementor Pro',
    version: 'v2.5.1',
    updatedDate: '22/09/2026',
    price: 399000,
    originalPrice: 750000,
    salesCount: 980,
    rating: 4.95,
    ratingCount: 112,
    badge: 'Nổi bật',
    badgeColor: 'violet',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linaagency-ultra',
    pageSpeed: 98,
    description: 'Theme dành riêng cho các doanh nghiệp, Agency tiếp thị, công ty phần mềm SaaS và Startup. Tích hợp hiệu ứng Glassmorphism đẳng cấp, 3D Tilt interactive cards, và hơn 30+ layout trang chủ dựng sẵn.',
    features: [
      '30+ Trang chủ Demo sẵn có nhập trong 1-Click',
      'Hiệu ứng Particle, Glassmorphism & Smooth Parallax Scroll',
      'Tích hợp Form báo giá tự động & Booking hẹn lịch',
      'Tối ưu SEO On-page chuẩn Schema Org & Rich Snippets',
      'Tự động tương thích Dark Mode & Light Mode',
      'Thư viện 100+ Khối UI UIkit tùy chỉnh riêng của LinaDesign'
    ],
    compatibility: ['Elementor Pro', 'Contact Form 7', 'RankMath', 'WP Rocket'],
    reviews: [
      { author: 'Đặng Quốc Bảo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating: 5, date: '18/09/2026', comment: 'Hiệu ứng đẹp ngỡ ngàng! Đúng chuẩn xu hướng web hiện đại 2026.' }
    ]
  },
  {
    id: 'lina-estate-luxe',
    name: 'LinaEstate Luxe',
    slug: 'linaestate-luxe',
    subtitle: 'Theme Bất Động Sản, Cho Thuê Căn Hộ & Dự Án Đô Thị',
    category: 'Bất Động Sản',
    builder: 'Elementor Pro',
    version: 'v4.1.0',
    updatedDate: '24/09/2026',
    price: 599000,
    originalPrice: 1200000,
    salesCount: 740,
    rating: 4.88,
    ratingCount: 95,
    badge: 'Độc quyền',
    badgeColor: 'emerald',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linaestate-luxe',
    pageSpeed: 97,
    description: 'Chuyên biệt cho sàn giao dịch BĐS, môi giới & chủ đầu tư dự án. Tích hợp bản đồ vệ tinh Google Maps / OpenStreetMap, tìm kiếm BĐS theo bán kính/khoảng giá/pháp lý, xem Virtual Tour 360 độ.',
    features: [
      'Bộ lọc tìm kiếm BĐS đa tiêu chí (Vị trí, giá, diện tích, số phòng)',
      'Tích hợp bản đồ tương tác hiển thị ghim tiện ích xung quanh',
      'Tích hợp Virtual Tour 360 & Video Youtube/Vimeo 4K',
      'Tính năng so sánh bất động sản & Đăng tin dành cho môi giới',
      'Bảng tính vay ngân hàng & trả góp hàng tháng trực quan'
    ],
    compatibility: ['Elementor', 'OpenStreetMap', 'WooCommerce', 'WPML'],
    reviews: [
      { author: 'Phạm Thanh Sơn', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', rating: 5, date: '10/09/2026', comment: 'Rất ưng ý tính năng lọc BĐS và tính lãi suất ngân hàng cho khách.' }
    ]
  },
  {
    id: 'lina-news-matrix',
    name: 'LinaNews Matrix',
    slug: 'linanews-matrix',
    subtitle: 'Theme Báo Điện Tử, Tạp Chí & Portal Tin Tức Đa Ngôn Ngữ',
    category: 'Tin Tức & Tạp Chí',
    builder: 'Gutenberg Native',
    version: 'v3.2.0',
    updatedDate: '19/09/2026',
    price: 349000,
    originalPrice: 650000,
    salesCount: 1150,
    rating: 4.9,
    ratingCount: 140,
    badge: 'AMP Ready',
    badgeColor: 'amber',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linanews-matrix',
    pageSpeed: 100,
    description: 'Tối ưu siêu tốc độ với Gutenberg thuần khiết không dùng plugin cồng kềnh. Hỗ trợ chuẩn Google AMP, Google News RSS, tính năng phát âm thanh bài viết bằng AI Text-to-Speech.',
    features: [
      'Tốc độ 100/100 Mobile & Desktop trên Google PageSpeed Insights',
      'Tích hợp phát đọc tin bằng giọng nói AI thông minh',
      'Quản lý vị trí quảng cáo Adsense / Banner linh hoạt',
      'Tối ưu hóa SEO bài viết chuẩn Google News & Discover',
      'Chế độ đọc ban đêm (Dark Mode toggle) bảo vệ mắt'
    ],
    compatibility: ['Gutenberg', 'Google AMP', 'Yoast SEO', 'WP Super Cache'],
    reviews: [
      { author: 'Nguyễn Văn Hùng', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', rating: 5, date: '12/09/2026', comment: 'Trang tin tức load vèo vèo, doanh thu quảng cáo Google Adsense tăng 30% nhờ vị trí banner tối ưu.' }
    ]
  },
  {
    id: 'lina-edu-learn',
    name: 'LinaEdu Learn',
    slug: 'linaedu-learn',
    subtitle: 'Theme Giáo Dục, Khóa Học Online & LMS E-Learning',
    category: 'Giáo Dục & LMS',
    builder: 'Elementor Pro',
    version: 'v2.9.0',
    updatedDate: '21/09/2026',
    price: 449000,
    originalPrice: 850000,
    salesCount: 620,
    rating: 4.92,
    ratingCount: 78,
    badge: 'Hot',
    badgeColor: 'rose',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linaedu-learn',
    pageSpeed: 98,
    description: 'Giải pháp bán khóa học trực tuyến hoàn chỉnh. Tích hợp hệ thống quản lý học tập LMS, làm bài thi trắc nghiệm, cấp chứng chỉ PDF tự động, tích hợp Zoom & Google Meet live stream.',
    features: [
      'Tương thích hoàn hảo TutorLMS & LearnDash LMS',
      'Tạo khóa học video, tài liệu PDF, quiz bài tập trắc nghiệm',
      'Tự động tạo & xuất chứng chỉ hoàn thành học phần',
      'Thanh toán bán khóa học qua MoMo, VNPay, ZaloPay, Thẻ ATM/Visa',
      'Giao diện học viên Dashboard riêng biệt khoa học'
    ],
    compatibility: ['TutorLMS', 'LearnDash', 'WooCommerce', 'Zoom WP'],
    reviews: [
      { author: 'Vũ Thảo Chi', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', rating: 5, date: '08/09/2026', comment: 'Trung tâm anh ngữ của tôi đã vận hành trơn tru hơn 6 tháng nay nhờ theme này.' }
    ]
  },
  {
    id: 'lina-bake-food',
    name: 'LinaBake & Food',
    slug: 'linabake-food',
    subtitle: 'Theme Nhà Hàng, Tiệm Bánh, Quán Cafe & Đặt Món Online',
    category: 'Nhà Hàng & Food',
    builder: 'Elementor Pro',
    version: 'v1.8.0',
    updatedDate: '15/09/2026',
    price: 329000,
    originalPrice: 600000,
    salesCount: 430,
    rating: 4.87,
    ratingCount: 54,
    badge: 'Mới',
    badgeColor: 'cyan',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linabake-food',
    pageSpeed: 98,
    description: 'Theme dành cho nhà hàng, quán ăn, tiệm bánh ngọt. Hỗ trợ thực đơn điện tử QR Code tại bàn, hệ thống đặt bàn hẹn giờ trực tuyến và giao đồ ăn tận nơi.',
    features: [
      'Thực đơn điện tử Menu quét mã QR hiện đại',
      'Hệ thống Đặt bàn hẹn giờ thông minh tránh trùng lịch',
      'Tích hợp tính năng Giao hàng tận nơi & Tính phí theo KM',
      'Giao diện hấp dẫn tone màu ấm áp tôn vinh hình ảnh món ăn'
    ],
    compatibility: ['WooCommerce', 'Elementor', 'Foodly Plugin'],
    reviews: [
      { author: 'Ngô Thanh Vân', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', rating: 5, date: '05/09/2026', comment: 'Khách hàng quét QR order món cực tiện. Rất hài lòng.' }
    ]
  },
  {
    id: 'lina-health-care',
    name: 'LinaHealth Care',
    slug: 'linahealth-care',
    subtitle: 'Theme Phòng Khám, Bệnh Viện, Thẩm Mỹ Viện & Đặt Lịch Bác Sĩ',
    category: 'Y Tế & Thẩm Mỹ',
    builder: 'Elementor Pro',
    version: 'v2.1.0',
    updatedDate: '11/09/2026',
    price: 389000,
    originalPrice: 700000,
    salesCount: 510,
    rating: 4.91,
    ratingCount: 62,
    badge: 'Chuyên nghiệp',
    badgeColor: 'emerald',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linahealth-care',
    pageSpeed: 99,
    description: 'Thiết kế sang trọng chuẩn y khoa cho phòng khám đa khoa, nha khoa, thẩm mỹ viện, spa. Tích hợp form đăng ký khám bệnh theo bác sĩ và chuyên khoa.',
    features: [
      'Hệ thống Đặt lịch khám theo Bác sĩ & Khung giờ trống',
      'Trang giới thiệu đội ngũ Y Bác sĩ chuẩn chứng chỉ',
      'Bảng giá dịch vụ niêm yết rõ ràng minh bạch',
      'Form tư vấn miễn phí gửi thông báo qua Email/Zalo'
    ],
    compatibility: ['Elementor Pro', 'Bookly', 'Contact Form 7'],
    reviews: []
  },
  {
    id: 'lina-saas-cloud',
    name: 'LinaSaaS Cloud',
    slug: 'linasaas-cloud',
    subtitle: 'Theme Phần Mềm SaaS, Công Cụ AI & Digital Marketplace',
    category: 'Agency & Tech',
    builder: 'Elementor Pro',
    version: 'v1.4.0',
    updatedDate: '23/09/2026',
    price: 429000,
    originalPrice: 790000,
    salesCount: 880,
    rating: 4.96,
    ratingCount: 104,
    badge: 'Xu hướng 2026',
    badgeColor: 'violet',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linasaas-cloud',
    pageSpeed: 99,
    description: 'Tối ưu cho các công ty khởi nghiệp công nghệ AI, bán phần mềm SaaS subscription, ứng dụng di động. Tích hợp bảng so sánh bảng giá gói dịch vụ (Pricing Table toggle Monthly/Annual).',
    features: [
      'Bảng so sánh gói dịch vụ theo Tháng / Theo Năm có nút giảm giá',
      'Giao diện Dark Mode khoa học chuẩn Tech Trend',
      'Tích hợp Live Chat, Documentation Docs UI & FAQ Accordion',
      'Tích hợp Stripe, PayPal, VNPay cho gói Thuê Thuê Bao'
    ],
    compatibility: ['Elementor Pro', 'WooCommerce Subscriptions'],
    reviews: []
  },
  {
    id: 'lina-auto-speed',
    name: 'LinaAuto Speed',
    slug: 'linaauto-speed',
    subtitle: 'Theme Showroom Ô Tô, Xe Máy, Gara Sửa Chữa & Cho Thuê Xe',
    category: 'Ô Tô & Xe Máy',
    builder: 'Elementor Pro',
    version: 'v1.2.0',
    updatedDate: '25/09/2026',
    price: 499000,
    originalPrice: 950000,
    salesCount: 310,
    rating: 4.89,
    ratingCount: 42,
    badge: 'Mới ra mắt',
    badgeColor: 'cyan',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linaauto-speed',
    pageSpeed: 98,
    description: 'Theme chuyên biệt cho Showroom ô tô xe máy, dịch vụ mua bán xe lướt, gara chăm sóc bảo dưỡng xe detailing. Tích hợp bộ so sánh thông số kỹ thuật xe ô tô chuyên sâu.',
    features: [
      'Bảng so sánh 36+ thông số kỹ thuật chi tiết giữa các mẫu xe',
      'Form đăng ký Lái thử xe (Test Drive) tích hợp lịch đặt',
      'Tính năng định giá mua bán xe cũ & dự toán lăn bánh',
      'Bộ lọc xe theo Hãng, Năm sản xuất, Động cơ, Nhiên liệu & Mức giá'
    ],
    compatibility: ['Elementor Pro', 'WooCommerce', 'CarDealer Plugin'],
    reviews: []
  },
  {
    id: 'lina-travel-escape',
    name: 'LinaTravel Escape',
    slug: 'linatravel-escape',
    subtitle: 'Theme Du Lịch, Đặt Tour, Khách Sạn & Resort Nghỉ Dưỡng',
    category: 'Du Lịch & Tour',
    builder: 'Elementor Pro',
    version: 'v2.0.0',
    updatedDate: '24/09/2026',
    price: 459000,
    originalPrice: 880000,
    salesCount: 520,
    rating: 4.93,
    ratingCount: 68,
    badge: 'Đặc sắc',
    badgeColor: 'amber',
    image: '/images/hero-banner.jpg',
    demoUrl: 'https://linadesign.vn/demo/linatravel-escape',
    pageSpeed: 99,
    description: 'Giải pháp bán Tour du lịch & Đặt phòng khách sạn chuyên nghiệp. Tích hợp lịch khởi hành Tour tự động, tính giá theo người lớn/trẻ em, và bản đồ hành trình Tour chi tiết.',
    features: [
      'Hệ thống Đặt Tour & Giữ chỗ chọn ngày khởi hành linh hoạt',
      'Tính giá Tour thông minh (Người lớn, Trẻ em, Em bé)',
      'Tích hợp bản đồ lịch trình di chuyển theo từng ngày',
      'Gửi Email xác nhận đặt Tour kèm mã Vé QR Code'
    ],
    compatibility: ['Elementor Pro', 'WP Travel Engine', 'WooCommerce'],
    reviews: []
  }
];

// In-memory Database for Orders
const ordersData = [
  {
    orderId: 'ORD-892101',
    customerName: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@gmail.com',
    phone: '0908123456',
    paymentMethod: 'vietqr',
    paymentStatus: 'Đã thanh toán',
    totalAmount: 499000,
    discount: 0,
    finalAmount: 499000,
    items: [
      {
        id: 'lina-shop-pro',
        name: 'LinaShop Pro',
        price: 499000,
        version: 'v3.8.4',
        licenseKey: 'LINA-2026-X89K2-PL90A'
      }
    ],
    createdAt: '2026-09-25T14:32:00.000Z'
  },
  {
    orderId: 'ORD-773412',
    customerName: 'Lê Thu Trang',
    email: 'trang.le@techagency.vn',
    phone: '0977888999',
    paymentMethod: 'momo',
    paymentStatus: 'Đã thanh toán',
    totalAmount: 399000,
    discount: 79800,
    finalAmount: 319200,
    items: [
      {
        id: 'lina-agency-ultra',
        name: 'LinaAgency Ultra',
        price: 399000,
        version: 'v2.5.1',
        licenseKey: 'LINA-2026-A12B3-C45D6'
      }
    ],
    createdAt: '2026-09-26T07:15:00.000Z'
  }
];

// API Routes

// 1. Get List of Themes with search, category, builder & sort options
app.get('/api/themes', (req, res) => {
  let { category, builder, search, sort, minPrice, maxPrice } = req.query;
  let results = [...themesData];

  // Search filter
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.subtitle.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && category !== 'Tất cả') {
    results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  // Builder filter
  if (builder && builder !== 'Tất cả') {
    results = results.filter(t => t.builder.toLowerCase().includes(builder.toLowerCase()));
  }

  // Price filter
  if (minPrice) {
    results = results.filter(t => t.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(t => t.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'sales') {
    results.sort((a, b) => b.salesCount - a.salesCount);
  } else {
    // Default latest/popular
    results.sort((a, b) => b.salesCount - a.salesCount);
  }

  res.json({
    success: true,
    total: results.length,
    themes: results
  });
});

// 2. Get Single Theme Details
app.get('/api/themes/:id', (req, res) => {
  const theme = themesData.find(t => t.id === req.params.id || t.slug === req.params.id);
  if (!theme) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy theme WordPress này.' });
  }
  res.json({ success: true, theme });
});

// 3. Get Categories Summary
app.get('/api/categories', (req, res) => {
  const categoryMap = {};
  themesData.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
  });

  const categories = Object.keys(categoryMap).map(name => ({
    name,
    count: categoryMap[name]
  }));

  res.json({
    success: true,
    totalCount: themesData.length,
    categories
  });
});

// 4. Place Order & License Key Generation
app.post('/api/orders', (req, res) => {
  const { customerName, email, phone, items, paymentMethod, promoCode } = req.body;

  if (!customerName || !email || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin thanh toán.' });
  }

  let totalAmount = 0;
  const purchasedItems = [];

  items.forEach(item => {
    const found = themesData.find(t => t.id === item.id);
    if (found) {
      const qty = item.quantity || 1;
      totalAmount += found.price * qty;
      found.salesCount += qty; // Increase sales counter
      
      purchasedItems.push({
        id: found.id,
        name: found.name,
        price: found.price,
        version: found.version,
        licenseKey: `LINA-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      });
    } else if (item.id && item.id.startsWith('membership-')) {
      totalAmount += item.price;
      purchasedItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        version: 'VIP Pass',
        licenseKey: `LINA-VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      });
    }
  });

  // Apply promo discount if LINADESIGN2026 or Spin Wheel codes
  let discount = 0;
  if (promoCode && promoCode.toUpperCase() === 'LINADESIGN2026') {
    discount = Math.round(totalAmount * 0.2); // 20% discount
  } else if (promoCode && promoCode.toUpperCase() === 'LINA30') {
    discount = Math.round(totalAmount * 0.3); // 30% discount
  } else if (promoCode && promoCode.toUpperCase() === 'LINA50') {
    discount = Math.round(totalAmount * 0.5); // 50% discount
  }

  const finalAmount = Math.max(0, totalAmount - discount);
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  const newOrder = {
    orderId,
    customerName,
    email,
    phone,
    paymentMethod: paymentMethod || 'vietqr',
    paymentStatus: 'Đã thanh toán',
    totalAmount,
    discount,
    finalAmount,
    items: purchasedItems,
    createdAt: new Date().toISOString()
  };

  // Push to admin orders storage
  ordersData.unshift(newOrder);

  res.json({
    success: true,
    message: 'Tạo đơn hàng thành công! Mã bản quyền đã được kích hoạt.',
    order: newOrder
  });
});

// 4.1 License Verification & Domain Binding API
app.post('/api/license/verify', (req, res) => {
  const { licenseKey, domain } = req.body;

  if (!licenseKey) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã License Key.' });
  }

  const keyUpper = licenseKey.trim().toUpperCase();
  let foundItem = null;
  let foundOrder = null;

  for (const order of ordersData) {
    const item = order.items.find(i => i.licenseKey.toUpperCase() === keyUpper);
    if (item) {
      foundItem = item;
      foundOrder = order;
      break;
    }
  }

  if (foundItem) {
    if (domain) {
      foundItem.boundDomain = domain.trim().toLowerCase();
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Mã License Key chính hãng hợp lệ!',
      license: {
        key: foundItem.licenseKey,
        themeName: foundItem.name,
        customerName: foundOrder.customerName,
        email: foundOrder.email,
        boundDomain: foundItem.boundDomain || domain || 'Chưa gắn tên miền',
        createdAt: foundOrder.createdAt,
        status: 'Đang hoạt động (Kích hoạt trọn đời)'
      }
    });
  }

  // Fallback for demo test keys starting with LINA-
  if (keyUpper.startsWith('LINA-')) {
    return res.json({
      success: true,
      valid: true,
      message: 'Mã License Key chính hãng hợp lệ!',
      license: {
        key: keyUpper,
        themeName: 'LinaDesign Premium WordPress Theme',
        customerName: 'Khách Hàng LinaDesign',
        email: 'client@linadesign.vn',
        boundDomain: domain ? domain.trim().toLowerCase() : 'demo.yourdomain.com',
        createdAt: new Date().toISOString(),
        status: 'Đang hoạt động (Kích hoạt trọn đời)'
      }
    });
  }

  res.status(404).json({
    success: false,
    valid: false,
    message: 'Không tìm thấy mã License Key này trên hệ thống LinaDesign.'
  });
});

// 4.2 AI Live Chat Assistant API
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, reply: 'Xin chào! Tôi có thể giúp gì cho bạn?' });

  const msg = message.toLowerCase();
  let reply = 'Cảm ơn bạn đã nhắn tin! Bạn có thể xem demo các mẫu theme WordPress trên website hoặc để lại thông tin Zalo/Email để tư vấn viên hỗ trợ trong 5 phút.';

  if (msg.includes('mã') || msg.includes('giảm giá') || msg.includes('khuyến mãi') || msg.includes('coupon')) {
    reply = '🎁 Bạn có thể sử dụng mã ưu đãi: **LINADESIGN2026** để được giảm ngay 20% tổng đơn hàng, hoặc thử quay **Vòng Quay May Mắn** ở góc trái để nhận ưu đãi lên đến 50%! 🎉';
  } else if (msg.includes('license') || msg.includes('bản quyền') || msg.includes('key')) {
    reply = '🔑 Tất cả Theme WordPress tại LinaDesign đều đi kèm mã **License Key kích hoạt trọn đời**. Bạn có thể dùng tính năng **Tra Cứu License** trên menu để kiểm tra hoặc gắn tên miền (Domain Binding).';
  } else if (msg.includes('cài đặt') || msg.includes('elementor') || msg.includes('demo')) {
    reply = '⚡ LinaDesign hỗ trợ **Cài đặt Demo 1-Click chuẩn 100% giống bản xem trước miễn phí** trong 15 phút. Bạn chỉ cần inbox Zalo kỹ thuật sau khi mua hàng!';
  } else if (msg.includes('vip') || msg.includes('hội viên') || msg.includes('gói')) {
    reply = '⚡ **Gói VIP All-Access Pass** chỉ 1.490.000đ/năm cho phép bạn tải **KHÔNG GIỚI HẠN** toàn bộ 10+ mẫu WordPress Theme cao cấp nhất!';
  } else if (msg.includes('zalo') || msg.includes('hotline') || msg.includes('liên hệ')) {
    reply = '📞 Hotline / Zalo hỗ trợ kỹ thuật viễn thông 24/7: **0900.000.000** hoặc kết nối qua Zalo official account.';
  }

  res.json({ success: true, reply });
});

// 4.3 VIP Memberships Packages API
app.get('/api/memberships', (req, res) => {
  res.json({
    success: true,
    memberships: [
      {
        id: 'membership-starter',
        name: 'Gói VIP Starter',
        price: 599000,
        originalPrice: 990000,
        period: '1 Năm',
        badge: 'Phổ biến',
        badgeColor: 'cyan',
        features: [
          'Tải 3 Theme WordPress bất kỳ',
          'Bản quyền trọn đời 3 Domain',
          'Cập nhật 1-Click tự động 1 năm',
          'Hỗ trợ kỹ thuật 24/7 qua Ticket'
        ]
      },
      {
        id: 'membership-developer',
        name: 'Gói All-Access Pass',
        price: 1490000,
        originalPrice: 2990000,
        period: '1 Năm',
        badge: 'NÊN CHỌN',
        badgeColor: 'violet',
        features: [
          'Tải KHÔNG GIỚI HẠN 10+ Themes hiện có & Themes mới 2026',
          'Bản quyền không giới hạn tên miền (Unlimited Domains)',
          'Tự động tặng mã VIP License Key',
          'Cài đặt Demo miễn phí tận nơi',
          'Hỗ trợ ưu tiên 1-1 qua Zalo riêng'
        ]
      },
      {
        id: 'membership-lifetime',
        name: 'Gói Agency Lifetime',
        price: 2990000,
        originalPrice: 5990000,
        period: 'Trọn Đời',
        badge: 'Cao Cấp Nhất',
        badgeColor: 'emerald',
        features: [
          'Sở hữu TRỌN ĐỜI toàn bộ Kho Theme LinaDesign',
          'Cập nhật vĩnh viễn không đóng phí gia hạn',
          'Bản quyền không giới hạn tên miền',
          'Tặng bộ Plugin WooCommerce Pro trị giá 5.000.000đ',
          'Đội ngũ kỹ sư hỗ trợ riêng 24/7'
        ]
      }
    ]
  });
});

// ==========================================
// USER AUTHENTICATION & USER MANAGEMENT API
// ==========================================

// Auth 1. Login API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
  }

  const user = usersData.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  }

  res.json({
    success: true,
    message: `Đăng nhập thành công! Chào mừng ${user.fullName}.`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// Auth 2. Register API
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.' });
  }

  const existing = usersData.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Địa chỉ Email này đã được đăng ký tài khoản.' });
  }

  const newUser = {
    id: `usr-${Date.now().toString().slice(-6)}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'user', // Default role for registration is 'user'
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    createdAt: new Date().toISOString()
  };

  usersData.push(newUser);

  res.json({
    success: true,
    message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.',
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// Auth 3. Get Logged-in User Orders & License Keys
app.get('/api/auth/my-orders', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });

  const userOrders = ordersData.filter(o => o.email.toLowerCase() === email.trim().toLowerCase());

  res.json({
    success: true,
    total: userOrders.length,
    orders: userOrders
  });
});

// 5. Submit Theme Review
app.post('/api/reviews', (req, res) => {
  const { themeId, author, rating, comment } = req.body;

  if (!themeId || !author || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin đánh giá.' });
  }

  const theme = themesData.find(t => t.id === themeId);
  if (!theme) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy giao diện.' });
  }

  const newReview = {
    author,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    rating: Number(rating),
    date: new Date().toLocaleDateString('vi-VN'),
    comment
  };

  theme.reviews.unshift(newReview);
  // Recalculate average rating
  const totalStars = theme.reviews.reduce((acc, r) => acc + r.rating, 0);
  theme.rating = Number((totalStars / theme.reviews.length).toFixed(2));
  theme.ratingCount = theme.reviews.length;

  res.json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá!', themeRating: theme.rating, reviews: theme.reviews });
});

// 6. Newsletter Subscription
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Địa chỉ Email không hợp lệ.' });
  }
  res.json({
    success: true,
    message: 'Chúc mừng! Bạn đã đăng ký thành công. Mã giảm giá 20% của bạn là: LINADESIGN2026'
  });
});

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS
// ==========================================

// Admin 1. Get Analytics Overview
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = ordersData.reduce((acc, o) => acc + o.finalAmount, 0);
  const totalOrders = ordersData.length;
  const totalThemes = themesData.length;
  const totalLicenses = ordersData.reduce((acc, o) => acc + o.items.length, 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders,
      totalThemes,
      totalLicenses
    }
  });
});

// Admin 2. Get All Orders
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    total: ordersData.length,
    orders: ordersData
  });
});

// Admin Upload Image API
app.post('/api/admin/upload-image', upload.single('themeImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP, GIF, tối đa 5MB).' });
  }
  const imageUrl = `/images/${req.file.filename}`;
  res.json({ success: true, imageUrl, message: 'Upload ảnh thành công!' });
});

// Admin 3. Add New Theme (multipart/form-data with optional image)
app.post('/api/admin/themes', upload.single('themeImage'), (req, res) => {
  const { name, subtitle, category, builder, price, originalPrice, badge, badgeColor, description, features } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên theme, danh mục và giá.' });
  }

  const id = `lina-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const imageUrl = req.file ? `/images/${req.file.filename}` : '/images/hero-banner.jpg';

  const newTheme = {
    id,
    name,
    slug: id,
    subtitle: subtitle || 'Theme WordPress cao cấp tối ưu SEO',
    category,
    builder: builder || 'Elementor Pro',
    version: 'v1.0.0',
    updatedDate: new Date().toLocaleDateString('vi-VN'),
    price: Number(price),
    originalPrice: Number(originalPrice || price * 1.8),
    salesCount: 0,
    rating: 5.0,
    ratingCount: 1,
    badge: badge || 'Mới',
    badgeColor: badgeColor || 'cyan',
    image: imageUrl,
    demoUrl: `https://linadesign.vn/demo/${id}`,
    pageSpeed: 99,
    description: description || 'Giao diện WordPress hiện đại thiết kế bởi LinaDesign team.',
    features: Array.isArray(features) ? features : (features ? features.split('\n') : ['Elementor Pro Builder', 'Tối ưu tốc độ chuẩn Google', 'Tương thích WooCommerce']),
    compatibility: ['Elementor Pro', 'WooCommerce', 'Gutenberg'],
    reviews: []
  };

  themesData.unshift(newTheme);

  res.json({
    success: true,
    message: 'Đã thêm Theme mới thành công!',
    theme: newTheme
  });
});

// Admin 4. Update Existing Theme (multipart/form-data with optional image)
app.put('/api/admin/themes/:id', upload.single('themeImage'), (req, res) => {
  const themeIndex = themesData.findIndex(t => t.id === req.params.id);
  if (themeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy theme cần chỉnh sửa.' });
  }

  const current = themesData[themeIndex];
  const newImageUrl = req.file ? `/images/${req.file.filename}` : undefined;

  const updated = {
    ...current,
    ...req.body,
    price: req.body.price ? Number(req.body.price) : current.price,
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : current.originalPrice,
    image: newImageUrl || current.image,
    updatedDate: new Date().toLocaleDateString('vi-VN')
  };

  themesData[themeIndex] = updated;

  res.json({
    success: true,
    message: 'Cập nhật Theme thành công!',
    theme: updated
  });
});

// Admin 5. Delete Theme
app.delete('/api/admin/themes/:id', (req, res) => {
  const themeIndex = themesData.findIndex(t => t.id === req.params.id);
  if (themeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy theme cần xóa.' });
  }

  const deleted = themesData.splice(themeIndex, 1)[0];

  res.json({
    success: true,
    message: `Đã xóa thành công theme ${deleted.name}.`
  });
});

// 7. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'LinaDesign WordPress Themes Marketplace', timestamp: new Date() });
});

// Fallback to Index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 LinaDesign WordPress Themes Server running on http://localhost:${PORT}`);
});
