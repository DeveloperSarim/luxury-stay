import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import Nav from './Nav';
import Footer from './Footer';
import './Hero.css';
import './Reviews.css';
import './Features.css';
import './About.css';
import './Location.css';
import '../views/pages/Services.css';
import '../views/pages/PageLayout.css';
import { validateName, validateEmail, validatePhone, validatePassword, validateDate, validateDateRange, validateNumber } from '../utils/validations.js';

const Hero = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);
  const heroRef = useRef(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    numGuests: 1,
    notes: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingFormErrors, setBookingFormErrors] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [selectedRoomAvailability, setSelectedRoomAvailability] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [cursorPosition, setCursorPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [followerPosition, setFollowerPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [trailPositions, setTrailPositions] = useState(Array(8).fill({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
  const [cursorHover, setCursorHover] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const videoBgRef = useRef(null);
  const sectionsRef = useRef([]);
  const downloadLinkRef = useRef(null);

  // Check if device supports mouse (not touch)
  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window && window.innerWidth <= 1024;
      const isSmallScreen = window.innerWidth <= 768;
      setIsTouchDevice(isTouch && isSmallScreen);
    };
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Cursor effects with React state
  useEffect(() => {
    if (isTouchDevice) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = window.innerWidth / 2;
    let followerY = window.innerHeight / 2;
    let localTrailPositions = Array(8).fill({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    let animationRunning = true;

    // Smooth follower animation
    let followerFrameId;
    const animateFollower = () => {
      if (!animationRunning) return;
      
      const diffX = mouseX - followerX;
      const diffY = mouseY - followerY;
      
      followerX += diffX * 0.15;
      followerY += diffY * 0.15;
      
      setFollowerPosition({ x: followerX, y: followerY });
      
      followerFrameId = requestAnimationFrame(animateFollower);
    };
    animateFollower();

    // Smooth trail animation
    let trailFrameId;
    const animateTrails = () => {
      if (!animationRunning) return;
      
      const newTrailPositions = localTrailPositions.map((pos, index) => {
        const speed = 0.1 + (index * 0.02);
        const diffX = mouseX - pos.x;
        const diffY = mouseY - pos.y;
        return {
          x: pos.x + diffX * speed,
          y: pos.y + diffY * speed
        };
      });
      localTrailPositions = newTrailPositions;
      setTrailPositions(newTrailPositions);
      
      trailFrameId = requestAnimationFrame(animateTrails);
    };
    animateTrails();

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setCursorPosition({ x: mouseX, y: mouseY });
      setShowCursor(true);

      // Hero section parallax
      const hero = heroRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const isInHero = e.clientY >= rect.top && e.clientY <= rect.bottom && 
                        e.clientX >= rect.left && e.clientX <= rect.right;
        
        if (isInHero) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const percentX = (x / rect.width) * 100;
          const percentY = (y / rect.height) * 100;
          
          const moveX = (x / rect.width - 0.5) * 20;
          const moveY = (y / rect.height - 0.5) * 20;
          
          hero.style.setProperty('--mouse-x', `${percentX}%`);
          hero.style.setProperty('--mouse-y', `${percentY}%`);
          
          if (videoBgRef.current) {
            gsap.to(videoBgRef.current, {
              x: moveX,
              y: moveY,
              duration: 1,
              ease: 'power2.out'
            });
          }
        }
      }

      // Parallax effect on other sections using refs
      sectionsRef.current.forEach(section => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const isInSection = e.clientY >= rect.top && e.clientY <= rect.bottom && 
                           e.clientX >= rect.left && e.clientX <= rect.right;
        
        if (isInSection) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const moveX = (x / rect.width - 0.5) * 10;
          const moveY = (y / rect.height - 0.5) * 10;
          
          // Use refs for cards instead of querySelectorAll
          const cards = Array.from(section.querySelectorAll('.feature-card-new, .room-card-new, .testimonial-card-new, .faq-item-new'));
          cards.forEach((card, index) => {
            const delay = index * 0.05;
            gsap.to(card, {
              x: moveX * 0.3,
              y: moveY * 0.3,
              duration: 0.5 + delay,
              ease: 'power2.out'
            });
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      animationRunning = false;
      if (followerFrameId) cancelAnimationFrame(followerFrameId);
      if (trailFrameId) cancelAnimationFrame(trailFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouchDevice]);

  // Load available rooms
  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const response = await fetch('http://localhost:5000/api/rooms', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const rooms = Array.isArray(data) ? data : [];
        console.log('Loaded rooms:', rooms.length, rooms);
        
        if (rooms.length > 0) {
          setAvailableRooms(rooms);
        } else {
          console.warn('No rooms found in database');
          setAvailableRooms([]);
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
        // Show error but don't break the page
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    
    // Small delay to ensure backend is ready
    const timer = setTimeout(() => {
      loadRooms();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-select room when selectedRoomForBooking changes
  useEffect(() => {
    if (selectedRoomForBooking) {
      setBookingForm(prev => ({
        ...prev,
        room: selectedRoomForBooking
      }));
    }
  }, [selectedRoomForBooking]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'numGuests' ? parseInt(value) || 1 : value;
    
    setBookingForm(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    setBookingError('');
    
    // Real-time validation
    let fieldError = '';
    if (name === 'firstName' || name === 'lastName') {
      fieldError = validateName(value);
    } else if (name === 'email') {
      fieldError = validateEmail(value);
    } else if (name === 'phone') {
      fieldError = validatePhone(value);
    } else if (name === 'password' && value) {
      fieldError = validatePassword(value);
    } else if (name === 'confirmPassword' && value) {
      if (value !== bookingForm.password) {
        fieldError = 'Passwords match nahi kar rahe';
      }
    } else if (name === 'checkInDate') {
      fieldError = validateDate(value, 'Check-in Date');
    } else if (name === 'checkOutDate') {
      fieldError = validateDate(value, 'Check-out Date');
      if (!fieldError && bookingForm.checkInDate) {
        fieldError = validateDateRange(bookingForm.checkInDate, value, 'Check-in Date', 'Check-out Date');
      }
    } else if (name === 'numGuests') {
      fieldError = validateNumber(value, 'Number of Guests', 1, 20);
    }
    
    setBookingFormErrors({ ...bookingFormErrors, [name]: fieldError });
    
    // Re-validate check-out date if check-in date changes
    if (name === 'checkInDate' && bookingForm.checkOutDate) {
      const checkOutError = validateDateRange(value, bookingForm.checkOutDate, 'Check-in Date', 'Check-out Date');
      setBookingFormErrors({ ...bookingFormErrors, [name]: fieldError, checkOutDate: checkOutError });
    }
  };

  const calculateTotal = () => {
    if (!bookingForm.room || !bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
    const selectedRoom = availableRooms.find(r => r._id === bookingForm.room);
    if (!selectedRoom) return 0;
    
    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights * (selectedRoom.pricePerNight || 0);
  };

  const handleBookRoom = async (roomId) => {
    setSelectedRoomForBooking(roomId);
    setBookingForm(prev => ({
      ...prev,
      room: roomId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      checkInDate: '',
      checkOutDate: '',
      numGuests: 1,
      notes: ''
    }));
    setBookingError('');
    setBookingSuccess(false);
    setShowBookingModal(true);
    
    // Load room availability calendar
    const now = new Date();
    loadRoomAvailability(roomId, now.getMonth() + 1, now.getFullYear());
  };

  const loadRoomAvailability = async (roomId, month, year) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/availability?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRoomAvailability(data);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    }
  };

  const downloadQRCodePDF = async () => {
    if (!bookingResult || !bookingResult.qrCode) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 60] // Card size
      });

      const room = bookingResult.room || {};
      const guest = bookingResult.guest || {};

      // Purple background
      doc.setFillColor(86, 74, 222);
      doc.rect(0, 0, 100, 60, 'F');

      // White content area
      doc.setFillColor(255, 255, 255);
      doc.rect(3, 3, 94, 54, 'F');

      // Title
      doc.setTextColor(86, 74, 222);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LUXURY STAY', 50, 10, { align: 'center' });

      // QR Code
      const qrCodeImg = new Image();
      qrCodeImg.crossOrigin = 'anonymous';
      qrCodeImg.src = bookingResult.qrCode;
      
      await new Promise((resolve, reject) => {
        qrCodeImg.onload = () => {
          try {
            doc.addImage(qrCodeImg, 'PNG', 35, 15, 30, 30);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        qrCodeImg.onerror = () => reject(new Error('Failed to load QR code image'));
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout loading QR code')), 5000);
      });

      // Guest Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 48;
      doc.text(`Name: ${guest.firstName || ''} ${guest.lastName || ''}`, 5, yPos);
      yPos += 4;
      doc.text(`Room: ${room.roomNumber || 'N/A'} - ${room.type || ''}`, 5, yPos);
      yPos += 4;
      doc.text(`Phone: ${guest.phone || ''}`, 5, yPos);
      
      if (bookingResult.checkInDate) {
        yPos += 4;
        const checkIn = new Date(bookingResult.checkInDate).toLocaleDateString();
        const checkOut = new Date(bookingResult.checkOutDate).toLocaleDateString();
        doc.text(`Check-in: ${checkIn}`, 5, yPos);
        yPos += 4;
        doc.text(`Check-out: ${checkOut}`, 5, yPos);
      }

      // Reservation ID
      yPos += 4;
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`ID: ${bookingResult._id}`, 5, yPos);

      // Save PDF
      doc.save(`booking-card-${bookingResult._id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback: download QR code as image using ref
      try {
        if (downloadLinkRef.current) {
          downloadLinkRef.current.href = bookingResult.qrCode;
          downloadLinkRef.current.download = `qr-code-${bookingResult._id}.png`;
          downloadLinkRef.current.click();
        }
      } catch (fallbackErr) {
        alert('Failed to download. Please try again.');
      }
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoomForBooking(null);
    setBookingForm(prev => ({
      ...prev,
      room: ''
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);
    setSubmitting(true);

    try {
      // Validate all fields
      const firstNameError = validateName(bookingForm.firstName);
      const lastNameError = validateName(bookingForm.lastName);
      const emailError = validateEmail(bookingForm.email);
      const phoneError = validatePhone(bookingForm.phone);
      const checkInError = validateDate(bookingForm.checkInDate, 'Check-in Date');
      const checkOutError = validateDate(bookingForm.checkOutDate, 'Check-out Date');
      const dateRangeError = checkInError || checkOutError ? '' : validateDateRange(bookingForm.checkInDate, bookingForm.checkOutDate, 'Check-in Date', 'Check-out Date');
      const numGuestsError = validateNumber(bookingForm.numGuests, 'Number of Guests', 1, 20);
      
      let passwordError = '';
      let confirmPasswordError = '';
      if (bookingForm.password) {
        passwordError = validatePassword(bookingForm.password);
        if (!passwordError && bookingForm.password !== bookingForm.confirmPassword) {
          confirmPasswordError = 'Passwords do not match';
        }
      }
      
      const newErrors = {
        firstName: firstNameError,
        lastName: lastNameError,
        email: emailError,
        phone: phoneError,
        checkInDate: checkInError,
        checkOutDate: checkOutError || dateRangeError,
        numGuests: numGuestsError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      };
      
      setBookingFormErrors(newErrors);
      
      if (firstNameError || lastNameError || emailError || phoneError || 
          checkInError || checkOutError || dateRangeError || numGuestsError || 
          passwordError || confirmPasswordError) {
        setSubmitting(false);
        return;
      }

      // Submit booking to backend
      const response = await fetch('http://localhost:5000/api/reservations/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: bookingForm.firstName,
          lastName: bookingForm.lastName,
          email: bookingForm.email,
          phone: bookingForm.phone,
          room: bookingForm.room,
          checkInDate: bookingForm.checkInDate,
          checkOutDate: bookingForm.checkOutDate,
          numGuests: bookingForm.numGuests,
          notes: bookingForm.notes,
          password: bookingForm.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMessage = data.message || data.error || 'Failed to create booking';
        console.error('Booking error:', data);
        throw new Error(errorMessage);
      }

      // Show success message
      setBookingResult(data);
      setBookingSuccess(true);
      
      // Reset form
      setBookingForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        room: '',
        checkInDate: '',
        checkOutDate: '',
        numGuests: 1,
        notes: ''
      });
      setBookingFormErrors({});

      // Modal will not close automatically - user will close manually
    } catch (err) {
      setBookingError(err.message || 'Failed to process booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Available', class: 'status-available' },
      occupied: { text: 'Occupied', class: 'status-occupied' },
      maintenance: { text: 'Maintenance', class: 'status-maintenance' },
      cleaning: { text: 'Cleaning', class: 'status-cleaning' },
    };
    return statusMap[status] || { text: status, class: '' };
  };

  const services = [
    { icon: '68adc88e591a81fed12cc109_Key.svg', title: 'Easy Check-in', desc: 'Self check-in with smart lock' },
    { icon: '68adc88e929c98412b61a39a_WifiHigh.svg', title: 'High-Speed WiFi', desc: 'Free unlimited internet' },
    { icon: '68adc88e1f31e1e9f33be96c_Bed.svg', title: 'Comfortable Beds', desc: 'Premium mattress & linens' },
    { icon: '68adc88e9a5bd9060e1f99e4_Oven.svg', title: 'Full Kitchen', desc: 'Fully equipped for cooking' },
    { icon: '68adc88ecb6091c75bb946ac_Wind.svg', title: 'Climate Control', desc: 'AC & heating included' },
    { icon: '68adc88e13ab52118aa817b5_TelevisionSimple.svg', title: 'Smart TV', desc: 'Streaming services ready' },
  ];

  const rooms = [
    { img: '68af08e429f80a100d6e6fb8_pexels-heyho-7195560.avif', title: 'Dining Room', desc: 'Elegant dining space' },
    { img: '68af08e4f24a84bcdf5b01d7_pexels-heyho-7195593.avif', title: 'Modern Kitchen', desc: 'Fully equipped' },
    { img: '68af0bb6d611ff8ef82abe7b_pexels-heyho-7195537.avif', title: 'Living Room', desc: 'Spacious & cozy' },
    { img: '68af0bb64ae82124a3d83aa9_pexels-heyho-7195583.avif', title: 'Master Bedroom', desc: 'Luxury comfort' },
    { img: '68af0d802749a401537d6fb0_pexels-heyho-8142054.avif', title: 'Spa Bathroom', desc: 'Premium amenities' },
    { img: '68af0bb654dcc6ae2da51409_pexels-heyho-7195524.avif', title: 'Home Office', desc: 'Work from home ready' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', location: 'London, UK', rating: 5, text: 'Absolutely stunning apartment! The location is perfect and the interior design is beautiful. Will definitely stay again!', img: '68b1541ea146667517f34f9a_Andrew K..avif' },
    { name: 'Michael Chen', location: 'Tokyo, Japan', rating: 5, text: 'Best Airbnb experience ever! Clean, modern, and the host was incredibly responsive. Highly recommend!', img: '68b1541e0bb057d0b74f730c_Lina S..avif' },
    { name: 'Emma Williams', location: 'Sydney, Australia', rating: 5, text: 'Perfect stay in NYC! The apartment exceeded all expectations. Great value for money!', img: '68b1541ec891d0fa1c56a790_William N..avif' },
    { name: 'David Martinez', location: 'Barcelona, Spain', rating: 5, text: 'Incredible location and beautiful space. Everything was perfect from check-in to check-out!', img: '68b1541e90a6e7759fb1eccf_Patrick T..avif' },
  ];

  const faqs = [
    { q: 'What is the check-in process?', a: 'You\'ll receive a smart lock code 24 hours before arrival. Self check-in is available 24/7.' },
    { q: 'Is parking available?', a: 'Street parking is available, and we can provide information about nearby parking garages.' },
    { q: 'Are pets allowed?', a: 'Yes, small pets are welcome with prior approval. A pet fee may apply.' },
    { q: 'What is the cancellation policy?', a: 'Free cancellation up to 48 hours before check-in. After that, 50% refund.' },
    { q: 'Is there a minimum stay?', a: 'Minimum stay is 2 nights. Longer stays may qualify for discounts.' },
    { q: 'What amenities are included?', a: 'All basic amenities including WiFi, kitchen, linens, and toiletries are included.' },
  ];

  // Hover handlers for cursor effects
  const handleInteractiveMouseEnter = () => {
    setCursorHover(true);
  };

  const handleInteractiveMouseLeave = () => {
    setCursorHover(false);
  };

  // Magnetic effect handler
  const handleMagneticHover = (e) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const handleMagneticMove = (moveEvent) => {
      const distanceX = moveEvent.clientX - centerX;
      const distanceY = moveEvent.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const moveX = distanceX * force * 0.3;
        const moveY = distanceY * force * 0.3;
        
        gsap.to(element, {
          x: moveX,
          y: moveY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMagneticLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
      window.removeEventListener('mousemove', handleMagneticMove);
      element.removeEventListener('mouseleave', handleMagneticLeave);
    };

    window.addEventListener('mousemove', handleMagneticMove);
    element.addEventListener('mouseleave', handleMagneticLeave);
  };

  return (
    <div className="new-landing-page" style={{ cursor: isTouchDevice ? 'default' : 'none' }}>
      {/* Hidden download link for QR code fallback */}
      <a ref={downloadLinkRef} style={{ display: 'none' }} />
      {/* Custom Cursor - React Components */}
      {!isTouchDevice && (
        <>
          <div
            className={`custom-cursor ${cursorHover ? 'hover' : ''}`}
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              display: showCursor ? 'block' : 'none',
              opacity: showCursor ? 1 : 0,
              visibility: showCursor ? 'visible' : 'hidden',
            }}
          />
          <div
            className={`cursor-follower ${cursorHover ? 'hover' : ''}`}
            style={{
              left: `${followerPosition.x}px`,
              top: `${followerPosition.y}px`,
              display: showCursor ? 'block' : 'none',
              opacity: showCursor ? 1 : 0,
              visibility: showCursor ? 'visible' : 'hidden',
            }}
          />
          {trailPositions.map((pos, index) => (
            <div
              key={index}
              className="cursor-trail"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                opacity: (8 - index) / 8 * 0.5,
                display: showCursor ? 'block' : 'none',
              }}
            />
          ))}
        </>
      )}
      {/* Hero Section */}
      <section className="hero-new" ref={heroRef}>
        <div className="hero-video-background">
          <div className="video-overlay"></div>
          <video
            ref={videoBgRef}
            className="background-video"
            autoPlay
            loop
            muted
            playsInline
            poster="/stayscape-images/68aedb4f51c4fdbf6c074c38_pexels-heyho-7195529.avif"
          >
            <source src="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_30fps.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
          </video>
          <div className="video-fallback"></div>
        </div>
        <Nav />
        <div className="hero-container">
          <div className="hero-content-new">
            <div 
              className="hero-badge"
              onMouseEnter={handleInteractiveMouseEnter}
              onMouseLeave={handleInteractiveMouseLeave}
              onMouseEnterCapture={handleMagneticHover}
            >
              <span className="badge-icon">🏨</span>
              <span>Premium Luxury Hotel Experience</span>
            </div>
            <h1 className="hero-title">Luxury Stay Hotel</h1>
            <p className="hero-subtitle">Your perfect stay experience. Premium amenities, elegant rooms, and world-class service. Make your vacation unforgettable.</p>
            <div className="hero-stats">
              <div 
                className="stat-item" 
                style={{ '--i': 0 }}
                onMouseEnter={handleInteractiveMouseEnter}
                onMouseLeave={handleInteractiveMouseLeave}
                onMouseEnterCapture={handleMagneticHover}
              >
                <div className="stat-number">4.98</div>
                <div className="stat-label">Rating</div>
              </div>
              <div 
                className="stat-item" 
                style={{ '--i': 1 }}
                onMouseEnter={handleInteractiveMouseEnter}
                onMouseLeave={handleInteractiveMouseLeave}
                onMouseEnterCapture={handleMagneticHover}
              >
                <div className="stat-number">200+</div>
                <div className="stat-label">Happy Guests</div>
              </div>
              <div 
                className="stat-item" 
                style={{ '--i': 2 }}
                onMouseEnter={handleInteractiveMouseEnter}
                onMouseLeave={handleInteractiveMouseLeave}
                onMouseEnterCapture={handleMagneticHover}
              >
                <div className="stat-number">100%</div>
                <div className="stat-label">Response Rate</div>
              </div>
            </div>
            <div className="hero-buttons">
              <button 
                type="button"
                className="btn-primary"
                onClick={() => {
                  const roomsSection = document.getElementById('rooms');
                  if (roomsSection) {
                    roomsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onMouseEnter={handleInteractiveMouseEnter}
                onMouseLeave={handleInteractiveMouseLeave}
                onMouseEnterCapture={handleMagneticHover}
              >
                Book Now
              </button>
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/gallery')}
                onMouseEnter={handleInteractiveMouseEnter}
                onMouseLeave={handleInteractiveMouseLeave}
                onMouseEnterCapture={handleMagneticHover}
              >
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay" onClick={closeBookingModal}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="booking-modal-close" onClick={closeBookingModal}>×</button>
            
            <div className="booking-modal-header">
              <h2 className="booking-modal-title">Complete Your Booking</h2>
              {selectedRoomForBooking && (() => {
                const selectedRoom = availableRooms.find(r => r._id === selectedRoomForBooking);
                return selectedRoom ? (
                  <div className="selected-room-info">
                    <span>Room {selectedRoom.roomNumber} - {selectedRoom.type}</span>
                    <span className="selected-room-price">${selectedRoom.pricePerNight}/night</span>
                  </div>
                ) : null;
              })()}
            </div>

            {bookingSuccess ? (
              <div className="booking-success-message">
                <div className="success-icon">✓</div>
                <h3>Booking Confirmed! 🎉</h3>
                <p>Your booking has been successfully created and QR code has been sent to your email.</p>
                {bookingResult && (
                  <div className="booking-result-details">
                    <div className="result-info">
                      <strong>Reservation ID:</strong> {bookingResult._id}
                    </div>
                    {bookingResult.qrCode && (
                      <div className="qr-code-display">
                        <p><strong>Your QR Code:</strong></p>
                        <img src={bookingResult.qrCode} alt="QR Code" className="qr-code-image" />
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                          Present this QR code at reception for check-in
                        </p>
                        <button 
                          className="btn-primary"
                          onClick={downloadQRCodePDF}
                          style={{ marginTop: '15px', width: '100%' }}
                        >
                          📥 Download QR Code Card (PDF)
                        </button>
                      </div>
                    )}
                    <div className="result-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setShowBookingModal(false);
                          setBookingSuccess(false);
                          setBookingResult(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <div className="booking-form-row">
                  <div className="booking-form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={bookingForm.firstName}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      required
                      placeholder="Enter your first name"
                      className={bookingFormErrors.firstName ? 'input-error' : ''}
                    />
                    {bookingFormErrors.firstName && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="booking-form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={bookingForm.lastName}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      required
                      placeholder="Enter your last name"
                      className={bookingFormErrors.lastName ? 'input-error' : ''}
                    />
                    {bookingFormErrors.lastName && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="booking-form-row">
                  <div className="booking-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={bookingForm.email}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      required
                      placeholder="your.email@example.com"
                      className={bookingFormErrors.email ? 'input-error' : ''}
                    />
                    {bookingFormErrors.email && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="booking-form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      required
                      placeholder="+1 (555) 123-4567"
                      className={bookingFormErrors.phone ? 'input-error' : ''}
                    />
                    {bookingFormErrors.phone && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="booking-form-row">
                  <div className="booking-form-group">
                    <label>Create Password (Optional)</label>
                    <input
                      type="password"
                      name="password"
                      value={bookingForm.password}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      placeholder="Min 6 characters"
                      minLength="6"
                      className={bookingFormErrors.password ? 'input-error' : ''}
                    />
                    {bookingFormErrors.password && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.password}
                      </p>
                    )}
                    <small style={{ color: '#666', fontSize: '12px' }}>Create an account to manage your bookings</small>
                  </div>
                  <div className="booking-form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={bookingForm.confirmPassword}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      placeholder="Re-enter password"
                      disabled={!bookingForm.password}
                      className={bookingFormErrors.confirmPassword ? 'input-error' : ''}
                    />
                    {bookingFormErrors.confirmPassword && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="booking-form-row">
                  <div className="booking-form-group">
                    <label>Room Selected *</label>
                    <div className="selected-room-display">
                      {selectedRoomForBooking && (() => {
                        const selectedRoom = availableRooms.find(r => r._id === selectedRoomForBooking);
                        return selectedRoom ? (
                          <div className="selected-room-card">
                            <span>Room {selectedRoom.roomNumber}</span>
                            <span>{selectedRoom.type}</span>
                            <span>${selectedRoom.pricePerNight}/night</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="booking-form-group">
                    <label>Number of Guests *</label>
                    <input
                      type="number"
                      name="numGuests"
                      value={bookingForm.numGuests}
                      onChange={handleBookingChange}
                      onBlur={handleBookingChange}
                      min="1"
                      max="20"
                      required
                      className={bookingFormErrors.numGuests ? 'input-error' : ''}
                    />
                    {bookingFormErrors.numGuests && (
                      <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                        {bookingFormErrors.numGuests}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date Inputs and Calendar for Date Selection */}
                {selectedRoomForBooking && (
                  <div className="booking-calendar-section">
                    <label>Select Dates *</label>
                    
                    {/* Date Input Fields */}
                    <div className="booking-form-row" style={{ marginBottom: '20px' }}>
                      <div className="booking-form-group">
                        <label>Check-in Date *</label>
                        <input
                          type="date"
                          name="checkInDate"
                          value={bookingForm.checkInDate}
                          onChange={handleBookingChange}
                          onBlur={handleBookingChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className={bookingFormErrors.checkInDate ? 'input-error' : ''}
                        />
                        {bookingFormErrors.checkInDate && (
                          <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                            {bookingFormErrors.checkInDate}
                          </p>
                        )}
                      </div>
                      <div className="booking-form-group">
                        <label>Check-out Date *</label>
                        <input
                          type="date"
                          name="checkOutDate"
                          value={bookingForm.checkOutDate}
                          onChange={handleBookingChange}
                          onBlur={handleBookingChange}
                          required
                          min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                          className={bookingFormErrors.checkOutDate ? 'input-error' : ''}
                        />
                        {bookingFormErrors.checkOutDate && (
                          <p className="field-error-text" style={{ marginTop: '4px', fontSize: '12px', color: '#dc2626' }}>
                            {bookingFormErrors.checkOutDate}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
                      Or select dates from the calendar below:
                    </p>
                    <div className="availability-calendar">
                      {selectedRoomAvailability && (
                        <div className="calendar-month">
                          <div className="calendar-header">
                            <button 
                              type="button"
                              onClick={() => {
                                const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                                const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                                setCurrentMonth(newMonth);
                                setCurrentYear(newYear);
                                loadRoomAvailability(selectedRoomForBooking, newMonth, newYear);
                              }}
                              className="calendar-nav-btn"
                            >
                              ←
                            </button>
                            <h4>{new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                            <button 
                              type="button"
                              onClick={() => {
                                const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
                                const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
                                setCurrentMonth(newMonth);
                                setCurrentYear(newYear);
                                loadRoomAvailability(selectedRoomForBooking, newMonth, newYear);
                              }}
                              className="calendar-nav-btn"
                            >
                              →
                            </button>
                          </div>
                          <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="calendar-day-header">{day}</div>
                            ))}
                            {(() => {
                              const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
                              const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                              const days = [];
                              
                              // Empty cells for days before month starts
                              for (let i = 0; i < firstDay; i++) {
                                days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
                              }
                              
                              // Days of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const isAvailable = selectedRoomAvailability.availability[day];
                                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
                                const isSelected = bookingForm.checkInDate === dateStr || bookingForm.checkOutDate === dateStr;
                                const isInRange = bookingForm.checkInDate && bookingForm.checkOutDate && 
                                  dateStr >= bookingForm.checkInDate && dateStr <= bookingForm.checkOutDate;
                                
                                days.push(
                                  <div
                                    key={day}
                                    className={`calendar-day ${!isAvailable || isPast ? 'unavailable' : 'available'} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
                                    onClick={() => {
                                      if (isPast || !isAvailable) return;
                                      
                                      if (!bookingForm.checkInDate || (bookingForm.checkInDate && bookingForm.checkOutDate)) {
                                        // Start new selection
                                        const newForm = {
                                          ...bookingForm,
                                          checkInDate: dateStr,
                                          checkOutDate: ''
                                        };
                                        setBookingForm(newForm);
                                        // Validate
                                        const checkInError = validateDate(dateStr, 'Check-in Date');
                                        setBookingFormErrors({ ...bookingFormErrors, checkInDate: checkInError, checkOutDate: '' });
                                      } else if (dateStr > bookingForm.checkInDate) {
                                        // Set check-out date
                                        const newForm = {
                                          ...bookingForm,
                                          checkOutDate: dateStr
                                        };
                                        setBookingForm(newForm);
                                        // Validate
                                        const checkOutError = validateDate(dateStr, 'Check-out Date');
                                        const dateRangeError = checkOutError ? '' : validateDateRange(bookingForm.checkInDate, dateStr, 'Check-in Date', 'Check-out Date');
                                        setBookingFormErrors({ ...bookingFormErrors, checkOutDate: checkOutError || dateRangeError });
                                      } else {
                                        // Reset and set new check-in
                                        const newForm = {
                                          ...bookingForm,
                                          checkInDate: dateStr,
                                          checkOutDate: ''
                                        };
                                        setBookingForm(newForm);
                                        // Validate
                                        const checkInError = validateDate(dateStr, 'Check-in Date');
                                        setBookingFormErrors({ ...bookingFormErrors, checkInDate: checkInError, checkOutDate: '' });
                                      }
                                    }}
                                  >
                                    {day}
                                  </div>
                                );
                              }
                              
                              return days;
                            })()}
                          </div>
                          <div className="calendar-legend">
                            <div className="legend-item">
                              <span className="legend-color available"></span>
                              <span>Available</span>
                            </div>
                            <div className="legend-item">
                              <span className="legend-color unavailable"></span>
                              <span>Booked</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="selected-dates-display">
                      {bookingForm.checkInDate && (
                        <div className="selected-date">
                          <strong>Check-in:</strong> {new Date(bookingForm.checkInDate).toLocaleDateString()}
                        </div>
                      )}
                      {bookingForm.checkOutDate && (
                        <div className="selected-date">
                          <strong>Check-out:</strong> {new Date(bookingForm.checkOutDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="booking-form-group">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingChange}
                    placeholder="Any special requests or notes..."
                    rows="3"
                  />
                </div>

                {calculateTotal() > 0 && (
                  <div className="booking-total">
                    <div className="total-label">Total Amount:</div>
                    <div className="total-amount">${calculateTotal().toFixed(2)}</div>
                  </div>
                )}

                {bookingError && (
                  <div className="booking-error">{bookingError}</div>
                )}

                <div className="booking-modal-actions">
                  <button 
                    type="button"
                    className="btn-secondary booking-cancel-btn"
                    onClick={closeBookingModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary booking-submit-btn"
                    disabled={submitting || !selectedRoomForBooking}
                  >
                    {submitting ? 'Processing...' : 'Complete Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Services Section - Complete from Services Page */}
      <section className="page-hero-section services-hero-section" id="features" ref={(el) => { if (el) sectionsRef.current[0] = el; }}>
        <div className="page-container">
          <div className="page-hero-wrapper">
            <div 
              data-wf-caption-variant="black" 
              className="caption"
            >
              <div className="caption-shape"></div>
              <div className="regular-s">Our Services</div>
            </div>
            <h1 className="h1 page-hero-title">Luxury Services & Amenities</h1>
            <p className="medium-m page-hero-subtitle">
              Experience world-class hospitality with our comprehensive range 
              of premium services designed to make your stay unforgettable.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section services-list-section">
        <div className="page-container big-container">
          <div className="services-grid">
            {[
              {
                icon: '68adc88e591a81fed12cc109_Key.svg',
                title: '24/7 Concierge',
                description: 'Round-the-clock assistance for all your needs and inquiries.',
              },
              {
                icon: '68adc88e902a5d278c7f237e_SealCheck.svg',
                title: 'Room Service',
                description: 'Premium dining delivered directly to your room.',
              },
              {
                icon: '68adc88e8bb01a90c7437f27_Armchair.svg',
                title: 'Spa & Wellness',
                description: 'Relax and rejuvenate with our luxury spa treatments.',
              },
              {
                icon: '68adc88e1f31e1e9f33be96c_Bed.svg',
                title: 'Housekeeping',
                description: 'Daily housekeeping service to keep your space pristine.',
              },
              {
                icon: '68adc88ee5136917326b20a1_MapPinSimpleLine.svg',
                title: 'Airport Transfer',
                description: 'Complimentary airport pickup and drop-off service.',
              },
              {
                icon: '68adc88ed7a35067ec7bbb95_Eyes.svg',
                title: 'Tour Guide',
                description: 'Expert local guides for personalized city tours.',
              },
            ].map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-card-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${service.icon}`}
                    alt={service.title}
                    className="service-card-icon"
                  />
                </div>
                <h3 className="h3 service-card-title">{service.title}</h3>
                <p className="medium-s service-card-description">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="rooms-display-new" id="rooms" ref={(el) => { if (el) sectionsRef.current[1] = el; }}>
        <div className="container-new">
          <div className="section-header">
            <span className="section-tag">Our Rooms</span>
            <h2 className="section-title">Choose Your Perfect Stay</h2>
            <p className="section-desc">Luxurious rooms designed for your comfort and relaxation</p>
          </div>
          
          {loadingRooms ? (
            <div className="rooms-loading-container">
              <div className="rooms-skeleton-grid">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="room-skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line skeleton-title"></div>
                      <div className="skeleton-line skeleton-text"></div>
                      <div className="skeleton-line skeleton-text short"></div>
                      <div className="skeleton-button"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="rooms-empty-container">
              <div className="rooms-empty-message">
                <div className="empty-icon">🏨</div>
                <h3 className="h3">No Rooms Available</h3>
                <p className="medium-m">No rooms are currently available. Please check back later.</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Make sure the backend server is running on http://localhost:5000
                </p>
              </div>
            </div>
          ) : (
            <div className="rooms-grid-new">
              {availableRooms.map((room) => {
                const statusBadge = getStatusBadge(room.status);
                return (
                  <div key={room._id} className="room-card-new">
                    <div className="room-image-container-new">
                      <div className="room-status-badge-new">
                        <span className={`room-status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <img 
                        src="/stayscape-images/68af08e429f80a100d6e6fb8_pexels-heyho-7195560.avif"
                        alt={`Room ${room.roomNumber}`}
                        className="room-image-new"
                      />
                    </div>
                    <div className="room-info-new">
                      <div className="room-header-new">
                        <h3 className="room-title-new">Room {room.roomNumber}</h3>
                        <span className="room-type-badge-new">{room.type}</span>
                      </div>
                      <p className="room-description-new">
                        {room.description || `Beautiful ${room.type.toLowerCase()} room with modern amenities and stunning views.`}
                      </p>
                      <div className="room-details-new">
                        <div className="room-detail-item-new">
                          <img 
                            src="/stayscape-images/68adc88e1f31e1e9f33be96c_Bed.svg"
                            alt=""
                            className="room-detail-icon-new"
                          />
                          <span>2 Guests</span>
                        </div>
                        <div className="room-detail-item-new">
                          <img 
                            src="/stayscape-images/68adc88e591a81fed12cc109_Key.svg"
                            alt=""
                            className="room-detail-icon-new"
                          />
                          <span>${room.pricePerNight || 290}/night</span>
                        </div>
                        {room.floor && (
                          <div className="room-detail-item-new">
                            <span>Floor {room.floor}</span>
                          </div>
                        )}
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="room-amenities-new">
                          {room.amenities.slice(0, 4).map((amenity, idx) => (
                            <span key={idx} className="amenity-tag-new">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        to="/login"
                        className={`room-book-btn-new ${room.status !== 'available' ? 'disabled' : ''}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        {room.status === 'available' ? 'Book Room' : 'Unavailable'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* About Section - From About Component */}
      
      <section id="about" className="about" ref={(el) => { if (el) sectionsRef.current[2] = el; }}>
      <div data-wf-caption-variant="black" className="caption">
                    <div className="caption-shape"></div>
                    <div className="regular-s">About</div>
                  </div>
        <div className="w-layout-blockcontainer container big-container w-container">
          <div className="about-content">
            <div className="person-block">
              <div className="person-block-content">
                <div className="person-block-image-wrapper">
                  <img 
                    src="/stayscape-images/68aefa9a474d7c66f0f99fa9_Benjamin Ross.avif" 
                    loading="lazy" 
                    alt="Benjamin Ross" 
                    className="person-block-image"
                  />
                  <div className="person-block-status">
                    <div className="person-block-status-circle"></div>
                  </div>
                </div>
                <div className="person-block-info">
                  <div className="medium-s">Sarim Yaseen</div>
                  <div className="medium-s person-block-description">Hotel Owner</div>
                </div>
              </div>
              <a 
                href="tel:+12125550199" 
                className="icon-button w-variant-5486c117-8f56-ac61-d2f9-9007614520f0 w-inline-block"
                data-wf-icon-button-variant="small"
              >
                <img 
                  src="/stayscape-images/68adc88e35a0c25f1799232d_PhoneCall.svg" 
                  loading="lazy" 
                  alt="Phone" 
                  className="icon icon-button-icon w-variant-5486c117-8f56-ac61-d2f9-9007614520f0"
                />
              </a>
            </div>
            
            <p className="medium-m about-text">
              "Hi, I'm Sarim. Luxury Stay is a luxurious hotel in the heart of the city, 
              with beautiful rooms, great amenities, and a friendly staff.
              We are committed to providing a comfortable and memorable stay for our guests."
            </p>
          </div>
        </div>
        
        <div className="ticker">
          <div className="ticker-item ticker-move-left">
            <div className="ticker-line move-left-line">
              {[
                { icon: '68adc88e591a81fed12cc109_Key.svg', text: 'Great check-in' },
                { icon: '68adc88e902a5d278c7f237e_SealCheck.svg', text: 'Responsive host' },
                { icon: '68adc88e8bb01a90c7437f27_Armchair.svg', text: 'Beautiful interior' },
                { icon: '68adc88e1f31e1e9f33be96c_Bed.svg', text: 'Comfortable beds' },
              ].map((feature, idx) => (
                <div key={idx} className="big-pill">
                  <div className="big-pill-icon-wrapper">
                    <img 
                      src={`/stayscape-images/${feature.icon}`}
                      loading="lazy" 
                      alt="" 
                      className="icon big-pill-icon"
                    />
                  </div>
                  <div className="regular-l big-pill-text">{feature.text}</div>
                </div>
              ))}
            </div>
            <div className="ticker-line move-left-line">
              {[
                { icon: '68adc88e591a81fed12cc109_Key.svg', text: 'Great check-in' },
                { icon: '68adc88e902a5d278c7f237e_SealCheck.svg', text: 'Responsive host' },
                { icon: '68adc88e8bb01a90c7437f27_Armchair.svg', text: 'Beautiful interior' },
                { icon: '68adc88e1f31e1e9f33be96c_Bed.svg', text: 'Comfortable beds' },
              ].map((feature, idx) => (
                <div key={`dup-${idx}`} className="big-pill">
                  <div className="big-pill-icon-wrapper">
                    <img 
                      src={`/stayscape-images/${feature.icon}`}
                      loading="lazy" 
                      alt="" 
                      className="icon big-pill-icon"
                    />
                  </div>
                  <div className="regular-l big-pill-text">{feature.text}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ticker-item ticker-move-right">
            <div className="ticker-line move-right-line">
              {[
                { icon: '68adc88ee5136917326b20a1_MapPinSimpleLine.svg', text: 'Great location' },
                { icon: '68adc88e591a81fed12cc101_Star-1.svg', text: 'Beautiful and walkable' },
                { icon: '68adc88ed7a35067ec7bbb95_Eyes.svg', text: 'Stunning views' },
                { icon: '68adc88ed2e2c254725cbff9_Image.svg', text: 'Scenic and peaceful' },
              ].map((feature, idx) => (
                <div key={idx} className="big-pill">
                  <div className="big-pill-icon-wrapper">
                    <img 
                      src={`/stayscape-images/${feature.icon}`}
                      loading="lazy" 
                      alt="" 
                      className="icon big-pill-icon"
                    />
                  </div>
                  <div className="regular-l big-pill-text">{feature.text}</div>
                </div>
              ))}
            </div>
            <div className="ticker-line move-right-line">
              {[
                { icon: '68adc88ee5136917326b20a1_MapPinSimpleLine.svg', text: 'Great location' },
                { icon: '68adc88e591a81fed12cc101_Star-1.svg', text: 'Beautiful and walkable' },
                { icon: '68adc88ed7a35067ec7bbb95_Eyes.svg', text: 'Stunning views' },
                { icon: '68adc88ed2e2c254725cbff9_Image.svg', text: 'Scenic and peaceful' },
              ].map((feature, idx) => (
                <div key={`dup-${idx}`} className="big-pill">
                  <div className="big-pill-icon-wrapper">
                    <img 
                      src={`/stayscape-images/${feature.icon}`}
                      loading="lazy" 
                      alt="" 
                      className="icon big-pill-icon"
                    />
                  </div>
                  <div className="regular-l big-pill-text">{feature.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Static from Reviews Component */}
      <section id="reviews" className="reviews" ref={(el) => { if (el) sectionsRef.current[3] = el; }}>
        <div className="w-layout-blockcontainer container big-container w-container">
          <div className="reviews-content">
            <div className="reviews-info">
              <div className="reviews-details">
                <div className="reviews-caption-and-rating">
                  <div data-wf-caption-variant="black" className="caption">
                    <div className="caption-shape"></div>
                    <div className="regular-s">Reviews</div>
                  </div>
                  <div className="reviews-rating">
                    <img 
                      src="/stayscape-images/68adc88ecb304dc88d339c88_Wreath-Left.svg" 
                      loading="lazy" 
                      alt="" 
                      className="reviews-rating-icon"
                    />
                    <div className="regular-xl">4.98</div>
                    <img 
                      src="/stayscape-images/68adc88e0cc8b26eadb21e5b_Wreath-Right.svg" 
                      loading="lazy" 
                      alt="" 
                      className="reviews-rating-icon"
                    />
                  </div>
                </div>
                <p className="medium-m reviews-description">
                  We're proud to deliver a stay that guests consistently love.
                </p>
              </div>
              
              <div className="small-review-blocks">
                <div className="small-review-block-wrapper first-block">
                  <div className="small-review-block">
                    <div className="medium-m">4.9</div>
                    <div className="medium-xs small-review-block-description">Cleanliness</div>
                  </div>
                </div>
                <div className="small-review-blocks-divider"></div>
                <div className="small-review-block-wrapper second-block">
                  <div className="small-review-block">
                    <div className="medium-m">5.0</div>
                    <div className="medium-xs small-review-block-description">Accuracy</div>
                  </div>
                </div>
                <div className="small-review-blocks-divider mobile-hide"></div>
                <div className="small-review-block-wrapper third-block">
                  <div className="small-review-block">
                    <div className="medium-m">5.0</div>
                    <div className="medium-xs small-review-block-description">Check-in</div>
                  </div>
                </div>
                <div className="small-review-blocks-divider"></div>
                <div className="small-review-block-wrapper fourth-block">
                  <div className="small-review-block">
                    <div className="medium-m">5.0</div>
                    <div className="medium-xs small-review-block-description">Communication</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="review-blocks-wrapper">
              <div className="review-blocks">
                {[
                  [
                    { name: 'Andrew K.', location: 'Zwolle, Netherlands', img: '68b1541ea146667517f34f9a_Andrew K..avif', text: 'Felt like a true home away from home! The apartment was spotless, beautifully decorated, and just steps from Central Park. The host was super responsive – I\'d definitely stay again.', date: 'Aug 28, 2025' },
                    { name: 'Lina S.', location: 'Berlin, Germany', img: '68b1541e0bb057d0b74f730c_Lina S..avif', text: 'Perfect spot for exploring lively New York! Central Park is minutes away, the subway close, and the apartment was cozy and stylish. Love it!', date: 'Aug 13, 2025' },
                    { name: 'William N.', location: 'Paphos, Cyprus', img: '68b1541ec891d0fa1c56a790_William N..avif', text: 'Stylish apartment with everything I needed. The host was quick to respond, making check-in super easy. Would recommend to anyone in New York.', date: 'Jul 20, 2025' },
                  ],
                  [
                    { name: 'Patrick T.', location: 'Warsaw, Poland', img: '68b1541e90a6e7759fb1eccf_Patrick T..avif', text: 'Amazing location on 5th Avenue! Central Park is a short walk away, and the apartment was safe, clean, and welcoming. The stylish design made it a perfect base to explore the city – truly a gem!', date: 'Jul 03, 2025' },
                    { name: 'Sofia W.', location: 'Rome, Italy', img: '68b1541e664aeb75a3835bab_Sofia W..avif', text: 'Such a comfortable stay! The beds were great, the apartment was quiet, and the host made check-in super easy. With a 100% response rate, communication was smooth and stress-free. Can\'t wait to return again soon!', date: 'Jun 08, 2025' },
                    { name: 'Julian M.', location: 'Havana, Cuba', img: '68b1541ea146667517f34f97_Julian M..avif', text: 'Fantastic stay! Cozy, spotless, and perfectly located. The photos don\'t do it justice – it\'s even better in person. Everything was so comfortable and well-prepared, and I\'ll definitely be back.', date: 'May 17, 2025' },
                  ],
                  [
                    { name: 'Inessa J.', location: 'Vienna, Austria', img: '68b1541e627dd85661f7583e_Inessa J..avif', text: 'Great value for the location. Comfortable beds, modern decor, and the subway is so close by. Ideal choice for a weekend in the city.', date: 'Apr 10, 2025' },
                    { name: 'Michael B.', location: 'Porto, Portugal', img: '68b1541e88243f69605f23fd_Michael B..avif', text: 'Superhost service all the way. The place was beautiful, communication was instant, and I felt right at home from the start. The atmosphere was so welcoming. Five stars without a doubt!', date: 'Mar 17, 2025' },
                    { name: 'Scarlett A.', location: 'Dublin, Ireland', img: '68b15685b0d868816c62e655_Scarlett A..avif', text: 'Wonderful stay in the heart of New York! The apartment was spotless, cozy, and had everything I needed. The host was friendly and responsive, which made the whole trip stress-free.', date: 'Feb 05, 2025' },
                  ],
                ].map((column, colIdx) => (
                  <div key={colIdx} className="review-blocks-column">
                    {column.map((review, idx) => (
                      <div key={idx} className="review-block">
                        <div className="review-block-content">
                          <div className="review-block-info">
                            <img 
                              src={`/stayscape-images/${review.img}`}
                              loading="lazy" 
                              alt={review.name}
                              className="review-block-image"
                            />
                            <div className="review-block-attribution">
                              <div className="medium-s">{review.name}</div>
                              <div className="medium-xs review-block-description">{review.location}</div>
                            </div>
                          </div>
                          <div className="review-block-rating">
                            <div className="medium-xs">5.0</div>
                            <img 
                              src="/stayscape-images/68adc88e97b75eba13c5a1d1_Star.svg" 
                              loading="lazy" 
                              alt="" 
                              className="icon review-block-rating-icon"
                            />
                          </div>
                        </div>
                        <p className="medium-s review-block-text">{review.text}</p>
                        <div className="medium-xs review-block-date">{review.date}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <a 
              href="https://www.airbnb.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="black-button w-variant-d972b4a4-052a-c714-9106-c658d02bd590 w-inline-block"
              data-wf-black-button-variant="secondary"
            >
              <div className="black-button-icon-wrapper w-variant-d972b4a4-052a-c714-9106-c658d02bd590">
                <div className="button-icons">
                  <img 
                    src="/stayscape-images/68adc88e0d9ecf56a75aab0f_ArrowUpRight.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon button-icon"
                  />
                  <img 
                    src="/stayscape-images/68aed3d0db1bb90e683bba6a_ArrowUpRight.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon button-icon absolute-icon"
                  />
                </div>
              </div>
              <div className="medium-s button-text w-variant-d972b4a4-052a-c714-9106-c658d02bd590">View All</div>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section - From Features Component */}
      <section id="features" className="features" ref={(el) => { if (el) sectionsRef.current[4] = el; }}>
        <div className="w-layout-blockcontainer container big-container w-container">
          <div className="features-content">
            <div className="features-info">
              <div 
                data-wf-section-heading-variant="center-black" 
                className="section-heading"
              >
                <div data-wf-caption-variant="black" className="caption">
                  <div className="caption-shape"></div>
                  <div className="regular-s">Features</div>
                </div>
                <h2 className="h2 section-title">Home Highlights</h2>
              </div>
              
              <div className="overview-blocks">
                <div className="overview-block-wrapper first-block">
                  <div className="overview-block">
                    <div className="overview-block-content">
                      <div className="regular-l">2</div>
                      <div className="overview-block-info">
                        <h3 className="h3">Bedrooms</h3>
                        <p className="medium-xs overview-block-description">Master and a guest bedroom</p>
                      </div>
                    </div>
                    <div className="overview-block-icon-wrapper">
                      <img 
                        src="/stayscape-images/68adc88e1f31e1e9f33be96c_Bed.svg" 
                        loading="lazy" 
                        alt="" 
                        className="icon overview-block-icon"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="overview-block-wrapper second-block">
                  <div className="overview-block">
                    <div className="overview-block-content">
                      <div className="regular-l">1</div>
                      <div className="overview-block-info">
                        <h3 className="h3">Bathroom</h3>
                        <p className="medium-xs overview-block-description">Large shared bathroom</p>
                      </div>
                    </div>
                    <div className="overview-block-icon-wrapper">
                      <img 
                        src="/stayscape-images/68adc88ecd1cce8916c4ebc2_Bathtub.svg" 
                        loading="lazy" 
                        alt="" 
                        className="icon overview-block-icon"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="overview-block-wrapper third-block">
                  <div className="overview-block">
                    <div className="overview-block-content">
                      <div className="regular-l">6</div>
                      <div className="overview-block-info">
                        <h3 className="h3">Guests</h3>
                        <p className="medium-xs overview-block-description">For up to 6 people</p>
                      </div>
                    </div>
                    <div className="overview-block-icon-wrapper">
                      <img 
                        src="/stayscape-images/68adc88ed4b1b16ee3e9198e_Users.svg" 
                        loading="lazy" 
                        alt="" 
                        className="icon overview-block-icon"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="amenities-info">
              <div data-wf-caption-variant="black" className="caption">
                <div className="caption-shape"></div>
                <div className="regular-s">Amenities</div>
              </div>
              
              <div className="feature-blocks">
                <div className="feature-blocks-column first-column">
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">Fast Wi-Fi</h3>
                    <img 
                      src="/stayscape-images/68adc88e929c98412b61a39a_WifiHigh.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">Equipped Kitchen</h3>
                    <img 
                      src="/stayscape-images/68adc88e9a5bd9060e1f99e4_Oven.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">Washer & Dryer</h3>
                    <img 
                      src="/stayscape-images/68adc88e6ed7a71438b8fb5e_WashingMachine.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                </div>
                
                <div id="w-node-e273f51d-dbf7-0379-700e-fb8fe637d26d-c31b66ee" className="feature-block-wrapper">
                  <div 
                    data-wf-feature-block-variant="vertical" 
                    className="feature-block w-variant-3ec11452-0f8b-29fc-2558-fe14b480db01"
                  >
                    <h3 className="h3 feature-block-title w-variant-3ec11452-0f8b-29fc-2558-fe14b480db01">Complete Essentials Kit</h3>
                    <img 
                      src="/stayscape-images/68adc88e9206458c0cc0edb9_CoatHanger.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon w-variant-3ec11452-0f8b-29fc-2558-fe14b480db01"
                    />
                  </div>
                </div>
                
                <div className="feature-blocks-column second-column">
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">Air Conditioning</h3>
                    <img 
                      src="/stayscape-images/68adc88ecb6091c75bb946ac_Wind.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">TV & Streaming</h3>
                    <img 
                      src="/stayscape-images/68adc88e13ab52118aa817b5_TelevisionSimple.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                  <div 
                    data-wf-feature-block-variant="horizontal" 
                    className="feature-block"
                  >
                    <h3 className="h3 feature-block-title">Safety Features</h3>
                    <img 
                      src="/stayscape-images/68adc88ea79d4cd09810be70_Siren.svg" 
                      loading="lazy" 
                      alt="" 
                      className="icon feature-block-icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - From Location Component */}
      <section id="location" className="location" ref={(el) => { if (el) sectionsRef.current[5] = el; }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="location-content">
            <div className="location-info">
              <div 
                data-wf-section-heading-variant="center-white" 
                className="section-heading w-variant-ea45a946-717b-1877-197d-32ffb16578e8"
              >
                <div 
                  data-wf-caption-variant="white" 
                  className="caption w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"
                >
                  <div className="caption-shape w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"></div>
                  <div className="regular-s">Location</div>
                </div>
                <h2 className="h2 section-title">Where You'll Stay</h2>
              </div>
              
              <div className="location-details">
                <div id="w-node-d2509726-09cd-497c-548c-5c5e61f0c87f-c31b66ee" className="caption-info-blocks">
                  <div className="caption-info-block-wrapper first-block">
                    <div className="caption-info-block">
                      <p className="medium-s caption-info-block-name">Neighborhood:</p>
                      <p className="regular-m caption-info-block-value">Upper East Side, Manhattan</p>
                    </div>
                  </div>
                  <div className="caption-info-blocks-divider"></div>
                  <div className="caption-info-block-wrapper second-block">
                    <div className="caption-info-block">
                      <p className="medium-s caption-info-block-name">Address:</p>
                      <p className="regular-m caption-info-block-value">953 5th Avenue, New York, USA</p>
                    </div>
                  </div>
                  <div className="caption-info-blocks-divider"></div>
                  <div className="caption-info-block-wrapper third-block">
                    <div className="caption-info-block">
                      <p className="medium-s caption-info-block-name">Floor:</p>
                      <p className="regular-m caption-info-block-value">40th Floor With Elevator</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="map">
              <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="icon-button w-inline-block"
                data-wf-icon-button-variant="big"
              >
                <img 
                  src="/stayscape-images/68adc88e8dea64e9b2c159c5_TrafficSign.svg" 
                  loading="lazy" 
                  alt="Direction" 
                  className="icon icon-button-icon"
                />
              </a>
              <div className="map-mark-wrapper">
                <div className="map-mark">
                  <img 
                    src="/stayscape-images/68adc88e0d9ecf56a75aab2b_Buildings.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon map-mark-icon"
                  />
                  <div className="map-mark-shape"></div>
                </div>
              </div>
              <img 
                src="/stayscape-images/68b16f7e83d311c06ce2c781_Map.avif" 
                loading="lazy" 
                alt="Map" 
                className="background-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Hero;
