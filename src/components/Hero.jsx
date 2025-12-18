import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Nav from './Nav';
import Footer from './Footer';
import './Hero.css';
import { validateName, validateEmail, validatePhone, validatePassword, validateDate, validateDateRange, validateNumber } from '../utils/validations.js';

const Hero = () => {
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
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const cursorTrailRefs = useRef([]);

  // GSAP Mouse Cursor Effects
  useEffect(() => {
    // Check if device supports mouse (not touch) - less strict check
    const isTouchDevice = 'ontouchstart' in window && window.innerWidth <= 1024;
    const isSmallScreen = window.innerWidth <= 768;
    
    // Only disable on actual touch devices with small screens
    if (isTouchDevice && isSmallScreen) {
      return; // Don't add cursor effects on touch devices
    }

    // Create custom cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
    cursorRef.current = cursor;
    document.body.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    cursorFollower.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
    cursorFollowerRef.current = cursorFollower;
    document.body.appendChild(cursorFollower);

    // Create cursor trail dots
    const trailCount = 8;
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.opacity = (trailCount - i) / trailCount * 0.5;
      trail.style.cssText += 'display: block !important; visibility: visible !important;';
      document.body.appendChild(trail);
      cursorTrailRefs.current.push(trail);
    }
    
    // Add class to body to hide default cursor
    document.body.classList.add('has-custom-cursor');
    
    // Force show cursor on page load
    setTimeout(() => {
      cursor.style.display = 'block';
      cursor.style.opacity = '1';
      cursor.style.visibility = 'visible';
      cursorFollower.style.display = 'block';
      cursorFollower.style.opacity = '1';
      cursorFollower.style.visibility = 'visible';
    }, 100);
    
    // Show cursor on first mouse move
    const showCursorOnMove = () => {
      cursor.style.display = 'block';
      cursor.style.opacity = '1';
      cursor.style.visibility = 'visible';
      cursorFollower.style.display = 'block';
      cursorFollower.style.opacity = '1';
      cursorFollower.style.visibility = 'visible';
      document.removeEventListener('mousemove', showCursorOnMove);
    };
    document.addEventListener('mousemove', showCursorOnMove);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = window.innerWidth / 2;
    let followerY = window.innerHeight / 2;
    let trailPositions = cursorTrailRefs.current.map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
    let animationRunning = true;

    // Smooth follower animation using requestAnimationFrame
    let followerFrameId;
    const animateFollower = () => {
      if (!animationRunning) return;
      
      const diffX = mouseX - followerX;
      const diffY = mouseY - followerY;
      
      followerX += diffX * 0.15; // Smooth interpolation
      followerY += diffY * 0.15;
      
      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top = followerY + 'px';
      cursorFollower.style.transform = 'translate(-50%, -50%)';
      
      followerFrameId = requestAnimationFrame(animateFollower);
    };
    animateFollower();

    // Smooth trail animation
    let trailFrameId;
    const animateTrails = () => {
      if (!animationRunning) return;
      
      cursorTrailRefs.current.forEach((trail, index) => {
        const speed = 0.1 + (index * 0.02);
        const diffX = mouseX - trailPositions[index].x;
        const diffY = mouseY - trailPositions[index].y;
        
        trailPositions[index].x += diffX * speed;
        trailPositions[index].y += diffY * speed;
        
        trail.style.left = trailPositions[index].x + 'px';
        trail.style.top = trailPositions[index].y + 'px';
        trail.style.transform = 'translate(-50%, -50%)';
      });
      
      trailFrameId = requestAnimationFrame(animateTrails);
    };
    animateTrails();

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Main cursor - EXACT position, instant update
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      cursor.style.display = 'block';
      cursor.style.opacity = '1';
      cursor.style.visibility = 'visible';
      cursor.style.transform = 'translate(-50%, -50%)';

      // Hero section parallax - only in hero section
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
          
          const videoBg = hero.querySelector('.background-video');
          if (videoBg) {
            gsap.to(videoBg, {
              x: moveX,
              y: moveY,
              duration: 1,
              ease: 'power2.out'
            });
          }
        }
      }

      // Parallax effect on other sections
      const sections = document.querySelectorAll('.features-new, .rooms-display-new, .about-new, .testimonials-new, .faq-new, .pricing-new, .location-new');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isInSection = e.clientY >= rect.top && e.clientY <= rect.bottom && 
                           e.clientX >= rect.left && e.clientX <= rect.right;
        
        if (isInSection) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const moveX = (x / rect.width - 0.5) * 10;
          const moveY = (y / rect.height - 0.5) * 10;
          
          const cards = section.querySelectorAll('.feature-card-new, .room-card-new, .testimonial-card-new, .faq-item-new');
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

    // Hover effects on interactive elements - PURE PAGE PAR
    const handleMouseEnter = (e) => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
      
      gsap.to(cursor, {
        scale: 1.3,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(cursorFollower, {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
      
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(cursorFollower, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Magnetic effect for buttons
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
        document.removeEventListener('mousemove', handleMagneticMove);
        element.removeEventListener('mouseleave', handleMagneticLeave);
      };

      document.addEventListener('mousemove', handleMagneticMove);
      element.addEventListener('mouseleave', handleMagneticLeave);
    };

    // Add hover effects to ALL interactive elements - PURE PAGE PAR
    const updateInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, .btn-primary, .btn-secondary, .menu-item, .room-card-new, .stat-item, .hero-badge, ' +
        '.feature-card-new, .testimonial-card-new, .faq-item-new, .room-book-btn-new, ' +
        '.footer-column a, .nav a, .logo, .icon-button, .menu-button'
      );
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Initial setup
    updateInteractiveElements();

    // Update on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      updateInteractiveElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Add magnetic effect to primary buttons and cards
    const updateMagneticElements = () => {
      const magneticElements = document.querySelectorAll(
        '.btn-primary, .btn-secondary, .hero-badge, .stat-item, ' +
        '.room-card-new, .feature-card-new, .testimonial-card-new'
      );
      
      magneticElements.forEach(el => {
        gsap.set(el, { x: 0, y: 0 });
        el.removeEventListener('mouseenter', handleMagneticHover);
        el.addEventListener('mouseenter', handleMagneticHover);
      });
    };

    updateMagneticElements();
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('mousemove', handleMouseMove);

    // Initial cursor position - center of screen - EXACT position
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    
    cursor.style.left = initialX + 'px';
    cursor.style.top = initialY + 'px';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.opacity = '1';
    cursor.style.display = 'block';
    
    cursorFollower.style.left = initialX + 'px';
    cursorFollower.style.top = initialY + 'px';
    cursorFollower.style.transform = 'translate(-50%, -50%)';
    cursorFollower.style.opacity = '1';
    cursorFollower.style.display = 'block';
    
    cursorTrailRefs.current.forEach((trail, index) => {
      trail.style.left = initialX + 'px';
      trail.style.top = initialY + 'px';
      trail.style.transform = 'translate(-50%, -50%)';
      trail.style.opacity = (8 - index) / 8 * 0.5;
      trail.style.display = 'block';
    });

    // Show cursor immediately
    cursor.style.display = 'block';
    cursor.style.opacity = '1';
    cursorFollower.style.display = 'block';
    cursorFollower.style.opacity = '1';

    return () => {
      animationRunning = false;
      if (followerFrameId) cancelAnimationFrame(followerFrameId);
      if (trailFrameId) cancelAnimationFrame(trailFrameId);
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      document.body.classList.remove('has-custom-cursor');
      if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
      if (cursorFollower && cursorFollower.parentNode) cursorFollower.parentNode.removeChild(cursorFollower);
      cursorTrailRefs.current.forEach(trail => {
        if (trail && trail.parentNode) trail.parentNode.removeChild(trail);
      });
      // Restore default cursor
      document.body.style.cursor = '';
    };
  }, []);

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
      // Fallback: download QR code as image
      try {
        const link = document.createElement('a');
        link.href = bookingResult.qrCode;
        link.download = `qr-code-${bookingResult._id}.png`;
        link.click();
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

  return (
    <div className="new-landing-page">
      {/* Hero Section */}
      <section className="hero-new" ref={heroRef}>
        <div className="hero-video-background">
          <div className="video-overlay"></div>
          <video
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
            <div className="hero-badge">
              <span className="badge-icon">🏨</span>
              <span>Premium Luxury Hotel Experience</span>
            </div>
            <h1 className="hero-title">Luxury Stay Hotel</h1>
            <p className="hero-subtitle">Your perfect stay experience. Premium amenities, elegant rooms, and world-class service. Make your vacation unforgettable.</p>
            <div className="hero-stats">
              <div className="stat-item" style={{ '--i': 0 }}>
                <div className="stat-number">4.98</div>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-item" style={{ '--i': 1 }}>
                <div className="stat-number">200+</div>
                <div className="stat-label">Happy Guests</div>
              </div>
              <div className="stat-item" style={{ '--i': 2 }}>
                <div className="stat-number">100%</div>
                <div className="stat-label">Response Rate</div>
              </div>
            </div>
            <div className="hero-buttons">
              <a href="#book" className="btn-primary">Book Now</a>
              <a href="#gallery" className="btn-secondary">View Gallery</a>
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

      {/* Features Section */}
      <section className="features-new" id="features">
        <div className="container-new">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need for a Perfect Stay</h2>
            <p className="section-desc">Premium amenities and thoughtful touches to make your stay comfortable</p>
          </div>
          <div className="features-grid-new">
            {services.map((service, idx) => (
              <div key={idx} className="feature-card-new">
                <div className="feature-icon-wrapper">
                  <img src={`/stayscape-images/${service.icon}`} alt={service.title} />
                </div>
                <h3 className="feature-title">{service.title}</h3>
                <p className="feature-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="rooms-display-new" id="rooms">
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
                      <button
                        onClick={() => handleBookRoom(room._id)}
                        className={`room-book-btn-new ${room.status !== 'available' ? 'disabled' : ''}`}
                        disabled={room.status !== 'available'}
                      >
                        {room.status === 'available' ? 'Book Room' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about-new" id="about">
        <div className="container-new">
          <div className="about-content-new">
            <div className="about-text">
              <span className="section-tag">About</span>
              <h2 className="section-title">Your Perfect NYC Experience Starts Here</h2>
              <p className="about-desc">
                Located in the prestigious Upper East Side, our luxury apartment offers the perfect blend of comfort, style, and convenience. 
                Just steps from Central Park, world-class museums, and fine dining, you'll have everything NYC has to offer at your doorstep.
              </p>
              <p className="about-desc">
                Our thoughtfully designed space features modern furnishings, premium amenities, and stunning city views. Whether you're visiting 
                for business or pleasure, we've created an environment where you can relax, work, and make lasting memories.
              </p>
              <div className="about-highlights">
                <div className="highlight-item">
                  <span className="highlight-number">2</span>
                  <span className="highlight-text">Bedrooms</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">1</span>
                  <span className="highlight-text">Bathroom</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">6</span>
                  <span className="highlight-text">Guests</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">40th</span>
                  <span className="highlight-text">Floor</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src="/stayscape-images/68aee162cd5516fe1813c629_pexels-heyho-7195570_1.avif" alt="About" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-new" id="reviews">
        <div className="container-new">
          <div className="section-header">
            <span className="section-tag">Reviews</span>
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-desc">Real experiences from travelers who stayed with us</p>
          </div>
          <div className="testimonials-grid-new">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="testimonial-card-new">
                <div className="testimonial-header">
                  <img src={`/stayscape-images/${testimonial.img}`} alt={testimonial.name} />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-location">{testimonial.location}</p>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-new" id="faq">
        <div className="container-new">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">Everything you need to know before booking</p>
          </div>
          <div className="faq-list-new">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item-new">
                <div 
                  className={`faq-question-new ${openFAQ === idx ? 'active' : ''}`}
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                >
                  <h3>{faq.q}</h3>
                  <span className="faq-icon">{openFAQ === idx ? '−' : '+'}</span>
                </div>
                <div className={`faq-answer-new ${openFAQ === idx ? 'active' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-new" id="pricing">
        <div className="container-new">
          <div className="pricing-content-new">
            <div className="pricing-info">
              <span className="section-tag">Pricing</span>
              <h2 className="section-title">Transparent Pricing, No Hidden Fees</h2>
              <div className="price-display">
                <span className="price-amount">$290</span>
                <span className="price-period">/ night</span>
              </div>
              <p className="pricing-desc">All taxes and fees included. Book 30+ days in advance for 15% off!</p>
              <ul className="pricing-features">
                <li>✓ Free cancellation up to 48 hours</li>
                <li>✓ No cleaning fees</li>
                <li>✓ All amenities included</li>
                <li>✓ 24/7 guest support</li>
              </ul>
              <a href="#book" className="btn-primary-large">Reserve Your Stay</a>
            </div>
            <div className="pricing-image">
              <img src="/stayscape-images/68af1c93cb63694c6eaf9ddc_pexels-heyho-7195595.avif" alt="Pricing" />
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-new" id="location">
        <div className="container-new">
          <div className="section-header">
            <span className="section-tag">Location</span>
            <h2 className="section-title">Prime Location in Upper East Side</h2>
            <p className="section-desc">Everything NYC has to offer is just minutes away</p>
          </div>
          <div className="location-content-new">
            <div className="location-info">
              <div className="location-detail">
                <h4>Address</h4>
                <p>953 5th Avenue, New York, NY 10021</p>
              </div>
              <div className="location-detail">
                <h4>Neighborhood</h4>
                <p>Upper East Side, Manhattan</p>
              </div>
              <div className="location-detail">
                <h4>Nearby Attractions</h4>
                <p>Central Park (2 min), The Met (5 min), Museum Mile (3 min)</p>
              </div>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                View on Map
              </a>
            </div>
            <div className="location-map">
              <img src="/stayscape-images/68b16f7e83d311c06ce2c781_Map.avif" alt="Map" />
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
