"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import {
    BookOpen,
    Brain,
    Sparkles,
    User,
    Users,
    Lock,
    Moon,
    Sun,
    Trophy,
    Clock,
    X,
    Send,
    ArrowRight,
    Activity,
    Phone,
    CheckCircle,
    AlertCircle,
    Stethoscope,
    Microscope,
    Eye,
    Bone,
    Baby,
    Syringe,
    Pill,
    Skull,
    Scissors,
    Zap,
    HeartPulse,
    Ear,
    TrendingUp,
    Trash2,
    Pencil,
    Plus,
    Home,
    LayoutGrid,
    GraduationCap,
    RefreshCw,
    Copy,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Search,
    ShieldAlert,
    Layers,
    Heart,
    Star,
    Timer,
    History,
    Award,
    Mic,
    Upload,
    Target,
    ClipboardList,
    ShieldCheck,
    Cpu,
    Database,
    Info
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { auth, db, googleProvider, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset } from '../lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit
} from 'firebase/firestore';
import { CLINICAL_CASES } from '../data/clinical-cases';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import Image from 'next/image';
import InstallPrompt from './InstallPrompt';
import CarouselSection, { UnifiedCarousel, CarouselCard } from './Carousel';

const CINEMATIC_COLLECTIONS = [
    {
        title: "Medical Masterpieces",
        items: [
            { id: 'p1', title: "Theory Foundations", image: "/poster-theory.png" },
            { id: 'p2', title: "Clinical Mastery", image: "/poster-clinical.png" },
            { id: 'p3', title: "Surgical Excellence", image: "/poster-surgical.png" },
            { id: 'p4', title: "Emergency Response", image: "/poster-emergency.png" },
            { id: 'p5', title: "The Neural Hub", image: "/poster-theory.png" },
            { id: 'p6', title: "Precision Diagnostics", image: "/poster-clinical.png" },
        ]
    },
    {
        title: "Clinical Originals",
        items: [
            { id: 'p7', title: "Emergency Response", image: "/poster-emergency.png" },
            { id: 'p8', title: "Surgical Excellence", image: "/poster-surgical.png" },
            { id: 'p9', title: "Theory Foundations", image: "/poster-theory.png" },
            { id: 'p10', title: "Clinical Mastery", image: "/poster-clinical.png" },
            { id: 'p11', title: "Neural Dynamics", image: "/poster-theory.png" },
            { id: 'p12', title: "Trauma Protocol", image: "/poster-emergency.png" },
        ]
    }
];

/**
 * ==========================================
 * TYPE DEFINITIONS
 * ==========================================
 */
import { BookEditModal, SectionEditModal } from './BookAdminModals';
import StudyMode from './StudyMode';
import type { ViewState, Book, BookPart, SubjectData, QuizQuestion, ChatMessage, AppUser, UserActivity } from '../types';
import { getAIAssistantResponse as getGeminiResponse } from '../lib/gemini';

/**
 * ==========================================
 * TYPE DEFINITIONS
 * ==========================================
 */
// Types moved to src/types.ts

/**
 * ==========================================
 * MOCK DATA
 * ==========================================
 */
const SUBJECTS: Record<string, SubjectData> = {
  "anatomy": {
    "name": "Human Anatomy",
    "id": "anatomy",
    "color": "bg-red-500",
    "icon": "User",
    "examSections": [],
    "materials": {
      "textbooks": [
        {
          "coverUrl": "https://m.media-amazon.com/images/I/71B1Qa31k8L._UF1000,1000_QL80_.jpg",
          "title": "Selective Anatomy: Prep Manual",
          "coverColor": "bg-red-700",
          "downloadUrl": "https://www.febbox.com/share/Ffgv3Anl",
          "type": "textbook",
          "id": "select-anat",
          "author": "Standard"
        }
      ],
      "studyMaterials": [
        {
          "title": "Marrow Anatomy",
          "coverColor": "bg-amber-500",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/jr01LMulVAYkftlU2QPp.png",
          "author": "8th Edition",
          "id": "marrow-anat",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/AgwtUL7T"
        },
        {
          "title": "Prepladder Anatomy",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/iIRAvlzLlE9X4LpXDSSo.png",
          "author": "X Edition",
          "id": "prepladder-anat",
          "downloadUrl": "https://drive.google.com/file/d/16ziRbuV1GKjHK_zZeg7wXKalCIs_MdsQ/view?usp=drive_link",
          "type": "notes"
        }
      ],
      "embryology": [
        {
          "id": "embryo-pims",
          "author": "Seniors",
          "downloadUrl": "https://www.febbox.com/share/YPEz2Y8z",
          "type": "textbook",
          "title": "Embryology Notes: PIMS",
          "coverColor": "bg-pink-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/CDUF3ofBC3KUA5R7mP1h.png"
        },
        {
          "downloadUrl": "https://www.febbox.com/share/az6meS80",
          "type": "textbook",
          "id": "embryo-notes",
          "author": "Standard",
          "coverUrl": "https://imgv2-2-f.scribdassets.com/img/document/697515802/original/ed7f418732/1?v=1",
          "coverColor": "bg-pink-500",
          "title": "Embryology Notes"
        },
        {
          "coverColor": "bg-pink-700",
          "title": "Vishram's Embryology",
          "coverUrl": "https://m.media-amazon.com/images/I/516GZXQju+L._UF1000,1000_QL80_.jpg",
          "id": "vishram-embryo",
          "author": "Standard",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/mXLoBdUu"
        }
      ],
      "previousYearQuestions": [
        {
          "author": "@DrAstroBot",
          "id": "anat-pyq-tg",
          "type": "textbook",
          "downloadUrl": "https://t.me/DrAstroBot",
          "title": "Anatomy University PYQs",
          "coverColor": "bg-red-600"
        },
        {
          "title": "Anatomy PYQs (2015-2023)",
          "coverColor": "bg-indigo-600",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ffgv3Anl",
          "id": "anat-pyq-1",
          "author": "University"
        }
      ],
      "histology": [
        {
          "author": "6th Edition",
          "id": "histo-atlas",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/vxfQYPw5",
          "title": "Histology: Text and Atlas",
          "coverColor": "bg-purple-600",
          "coverUrl": "https://m.media-amazon.com/images/I/61raBu9HfhL._UF1000,1000_QL80_.jpg"
        },
        {
          "coverUrl": "https://d45jl3w9libvn.cloudfront.net/jaypee/static/books/9789351523222/9789351523222.png",
          "coverColor": "bg-purple-500",
          "title": "IB Singh Histology",
          "downloadUrl": "https://www.febbox.com/share/p4ynoHwa",
          "type": "textbook",
          "author": "Standard",
          "id": "ib-singh-histo"
        }
      ],
      "grossAnatomy": [
        {
          "author": "10th Edition",
          "id": "bdc-main",
          "downloadUrl": "#",
          "type": "textbook",
          "parts": [
            {
              "title": "Volume 1: Upper Limb & Thorax",
              "downloadUrl": "https://www.febbox.com/share/K2aJpwDv",
              "id": "bdc-1"
            },
            {
              "id": "bdc-2",
              "title": "Volume 2: Lower Limb, Abdomen & Pelvis",
              "downloadUrl": "https://www.febbox.com/share/L83xvpQO"
            },
            {
              "title": "Volume 3: Head, Neck & Brain",
              "downloadUrl": "https://www.febbox.com/share/W1FFCCHF",
              "id": "bdc-3"
            }
          ],
          "coverUrl": "https://prithvibooks.com/wp-content/uploads/2020/05/Untitled-design-15-1.png",
          "coverColor": "bg-red-700",
          "title": "BD Chaurasia - Gross Anatomy"
        },
        {
          "title": "Vishram Singh - Gross Anatomy",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1422992570i/24819691.jpg",
          "parts": [
            {
              "id": "vishram-1",
              "title": "Volume 1: Upper Limb & Thorax",
              "downloadUrl": "https://www.febbox.com/share/7fXisDdE"
            },
            {
              "id": "vishram-2",
              "downloadUrl": "https://www.febbox.com/share/ZiXWOrBw",
              "title": "Volume 2: Lower Limb & Abdomen"
            },
            {
              "id": "vishram-3",
              "title": "Volume 3: Head, Neck & Brain",
              "downloadUrl": "https://www.febbox.com/share/XCK9YUSY"
            }
          ],
          "downloadUrl": "#",
          "type": "textbook",
          "id": "vishram-main",
          "author": "Standard"
        }
      ],
      "questionBank": [
        {
          "id": "anat-qb-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "question-bank",
          "coverColor": "bg-red-600",
          "title": "Anatomy High-Yield Q-Bank"
        },
        {
          "title": "Anatomy Q-Bank",
          "coverColor": "bg-blue-600",
          "type": "question-bank",
          "downloadUrl": "https://www.febbox.com/share/Ffgv3Anl",
          "id": "anat-qb-1",
          "author": "Standard"
        }
      ],
      "clinicalBooks": [
        {
          "downloadUrl": "https://www.febbox.com/share/RrGrgcty",
          "type": "clinical",
          "id": "cunningham-hn",
          "author": "14th Edition",
          "title": "Cunningham's Head & Neck",
          "coverColor": "bg-emerald-600",
          "coverUrl": "https://m.media-amazon.com/images/I/81Abkn0-sXL._UF1000,1000_QL80_.jpg"
        },
        {
          "id": "cunningham-limbs",
          "author": "14th Edition",
          "type": "clinical",
          "downloadUrl": "https://www.febbox.com/share/Yi7QvQ7S",
          "title": "Cunningham's Limbs",
          "coverColor": "bg-emerald-600",
          "coverUrl": "https://m.media-amazon.com/images/I/51DXvHxoXJL._UF350,350_QL50_.jpg"
        },
        {
          "downloadUrl": "https://www.febbox.com/share/ZwrWRoIY",
          "type": "clinical",
          "id": "cunningham-abdomen",
          "author": "14th Edition",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTuASM_l596FYGOr5kobKUfFP3tBk4PpqYTbvYpF8Ez1MDUXf9Q-TBNCE5aRsvjTPHByI&usqp=CAU",
          "coverColor": "bg-emerald-600",
          "title": "Cunningham's Thorax & Abd"
        },
        {
          "type": "clinical",
          "downloadUrl": "https://www.febbox.com/share/SwJhLNBL",
          "id": "moore-clin",
          "author": "Standard",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnNVbVxeptBmAF0HPTquI-riRJS6R67W0xSw&s",
          "coverColor": "bg-emerald-700",
          "title": "Moore's Clinically Oriented"
        }
      ],
      "anatomyAtlas": [
        {
          "id": "anat-360",
          "author": "Visual Guide",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/2GOSwZaq",
          "coverColor": "bg-blue-600",
          "title": "Anatomy 360",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJyyaItbw8sO6Eyx7MTAnL8Y5xQXqFMWdqNA&s"
        },
        {
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/3qypmZxF",
          "author": "Standard",
          "id": "cadaver-atlas",
          "coverColor": "bg-blue-700",
          "title": "Anatomy Cadaveric Atlas",
          "coverUrl": "https://www.kenhub.com/thumbor/KstJrZKjPGZFC1nDFTPcmOm9TKc=/fit-in/800x1600/filters:watermark(/images/logo_url.png,-10,-10,0):background_color(FFFFFF):format(jpeg)/images/library/6939/Color_Atlas_of_Anatomy_-_A_Photog._Study_of_the_Human_Body_.pdf__page_1_of_548__2018-03-18_23-32-38.jpg"
        },
        {
          "title": "Clinical Atlas of Human Anatomy",
          "coverColor": "bg-blue-500",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpZknEE8GodW2w1oCTjPU4UP1SrrzCzfcEhg&s",
          "downloadUrl": "https://www.febbox.com/share/oTzT668X",
          "type": "textbook",
          "author": "7th Edition",
          "id": "clin-atlas"
        }
      ],
      "practicalMaterials": [
        {
          "title": "Anatomy Practical Resources",
          "coverColor": "bg-red-600",
          "id": "anat-prac-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "textbook"
        }
      ],
      "generalAnatomy": [
        {
          "downloadUrl": "https://www.febbox.com/share/kgODmydR",
          "type": "textbook",
          "id": "bdc-gen-anat",
          "author": "4th Edition",
          "title": "BDC General Anatomy",
          "coverColor": "bg-red-600",
          "coverUrl": "https://rukminim2.flixcart.com/image/480/640/ki4w0i80-0/book/2/w/h/bd-chaurasia-s-handbook-of-general-anatomy-original-imafyy55wmyx9q7s.jpeg?q=90"
        },
        {
          "coverUrl": "https://m.media-amazon.com/images/I/51o2GaWwC+L.jpg",
          "coverColor": "bg-red-500",
          "title": "Vishram General Anatomy",
          "author": "Standard",
          "id": "vishram-gen-anat",
          "downloadUrl": "https://www.febbox.com/share/HbUqwQK5",
          "type": "textbook"
        }
      ]
    },
    "description": "Study of the structure of the human body.",
    "years": [1]
  },
  "anesthesiology": {
    "description": "Pain relief and total care of the surgical patient.",
    "years": [4],
    "materials": {
      "clinicalBooks": [],
      "questionBank": [],
      "studyMaterials": [
        {
          "author": "X Edition",
          "id": "prepladder-anesthesia",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/JkYj4Sf2",
          "title": "Prepladder Anesthesia",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/7g8gFBZyLKxRzFf94qle.png"
        }
      ],
      "textbooks": []
    },
    "examSections": [],
    "icon": "Syringe",
    "color": "bg-emerald-500",
    "id": "anesthesiology",
    "name": "Anesthesiology"
  },
  "biochemistry": {
    "id": "biochemistry",
    "color": "bg-yellow-500",
    "name": "Biochemistry",
    "description": "Chemical processes within and relating to living organisms.",
    "years": [1],
    "materials": {
      "previousYearQuestions": [
        {
          "coverColor": "bg-yellow-600",
          "title": "Biochemistry PYQs",
          "id": "bio-pyq-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "textbook"
        }
      ],
      "practicalMaterials": [
        {
          "coverColor": "bg-yellow-600",
          "title": "Biochemistry Practical Resources",
          "type": "textbook",
          "downloadUrl": "https://t.me/DrAstroBot",
          "author": "@DrAstroBot",
          "id": "bio-prac-tg"
        }
      ],
      "questionBank": [
        {
          "coverColor": "bg-yellow-600",
          "title": "Biochemistry Q-Bank",
          "id": "bio-qb-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "question-bank"
        }
      ],
      "clinicalBooks": [],
      "studyMaterials": [
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/zALXfU5bOPShm0wIt7gj.png",
          "title": "Marrow Biochemistry",
          "coverColor": "bg-amber-500",
          "downloadUrl": "https://www.febbox.com/share/OG1lnYI3",
          "type": "notes",
          "id": "marrow-bio",
          "author": "8th Edition"
        },
        {
          "title": "Prepladder Biochemistry",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "author": "X Edition",
          "id": "prepladder-bio",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9"
        }
      ],
      "textbooks": [
        {
          "coverColor": "bg-yellow-600",
          "title": "DM Vasudevan Biochemistry",
          "coverUrl": "https://rukminim2.flixcart.com/image/480/640/jx0prbk0/book/9/8/1/textbook-of-biochemistry-original-imafhkkzqnetezss.jpeg?q=20",
          "id": "dm-vasudevan",
          "author": "Vasudevan",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/1YRlhVKQ"
        },
        {
          "title": "R Manjeshwar PRASAD Biochemistry",
          "coverColor": "bg-yellow-500",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGMv_6OOjlyDIeWZiqhSELLOC0uBhn9dokog&s",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/FdBkbWeC",
          "author": "Manjeshwar",
          "id": "prasad-bio"
        }
      ]
    },
    "examSections": [],
    "icon": "Microscope"
  },
  "community-medicine": {
    "icon": "Users",
    "materials": {
      "questionBank": [
        {
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "question-bank",
          "id": "cm-qb-tg",
          "author": "@DrAstroBot",
          "coverColor": "bg-green-600",
          "title": "Community Medicine Q-Bank"
        }
      ],
      "previousYearQuestions": [
        {
          "coverColor": "bg-green-600",
          "title": "Community Medicine PYQs",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "textbook",
          "id": "cm-pyq-tg",
          "author": "@DrAstroBot"
        }
      ],
      "practicalMaterials": [
        {
          "coverColor": "bg-green-600",
          "title": "Community Medicine Practical Resources",
          "type": "textbook",
          "downloadUrl": "https://t.me/DrAstroBot",
          "id": "cm-prac-tg",
          "author": "@DrAstroBot"
        }
      ],
      "textbooks": [
        {
          "coverUrl": "https://rukminim2.flixcart.com/image/480/640/xif0q/book/l/i/n/parks-textbook-of-preventive-and-social-medicine-original-imah96sbgtyqbtva.jpeg?q=90",
          "coverColor": "bg-green-700",
          "title": "Park's Textbook of PSM",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "id": "park-30",
          "author": "30th Edition"
        },
        {
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx",
          "type": "textbook",
          "id": "suryakantha-3",
          "author": "3rd Edition",
          "coverColor": "bg-green-600",
          "title": "AH Suryakantha ComMed",
          "coverUrl": "https://m.media-amazon.com/images/I/81A4xoiHazL._UF1000,1000_QL80_.jpg"
        },
        {
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/ON1COGX1",
          "author": "Standard",
          "id": "cm-falcon",
          "coverColor": "bg-green-800",
          "title": "CM FALCON",
          "coverUrl": "https://m.media-amazon.com/images/I/51xPiZTxUmL.jpg"
        },
        {
          "id": "commed-shet",
          "author": "2nd Edition",
          "downloadUrl": "https://www.febbox.com/share/UGqO1EQT",
          "type": "textbook",
          "coverUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqQyJ8Ft-DWo8MIu2Q5mfX54Nv_uBMZ8fKWw&s",
          "title": "Commed Notes- Dr. Shetty",
          "coverColor": "bg-green-500"
        },
        {
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Xc0e7VOU",
          "id": "vivek-review-7",
          "author": "7th Edition",
          "title": "Review book Vivek Jain",
          "coverColor": "bg-green-700",
          "coverUrl": "https://m.media-amazon.com/images/I/91QshXYf2yL._UF1000,1000_QL80_.jpg"
        },
        {
          "coverUrl": "https://rukmini1.flixcart.com/image/300/300/xif0q/regionalbooks/s/a/2/preparatory-manual-of-preventive-and-social-medicine-3rd-revised-original-imah235emmezzsvj.jpeg",
          "coverColor": "bg-green-600",
          "title": "SIA Commed TEXTBOOK",
          "id": "sia-commed",
          "author": "Review",
          "downloadUrl": "https://www.febbox.com/share/es5xHlNe",
          "type": "textbook"
        },
        {
          "coverColor": "bg-green-500",
          "title": "Vivek Jain Prep Manual",
          "coverUrl": "https://images-eu.ssl-images-amazon.com/images/I/81Mz2bWKOmL._AC_UL600_SR600,600_.jpg",
          "downloadUrl": "https://www.febbox.com/share/VRfSE7yl",
          "type": "textbook",
          "author": "3rd Edition",
          "id": "vivek-prep-3"
        }
      ],
      "studyMaterials": [
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/fkEzRwmDxRDYtz0BtKxz.png",
          "title": "Marrow Community Med",
          "coverColor": "bg-amber-500",
          "downloadUrl": "#",
          "type": "notes",
          "id": "marrow-cm",
          "author": "8th Edition"
        },
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8D1Wqbd3LDx03FnlzEUS.png",
          "title": "Prepladder Community Med",
          "coverColor": "bg-amber-600",
          "id": "prepladder-cm",
          "author": "X Edition",
          "downloadUrl": "https://www.febbox.com/share/2xBr5JX3",
          "type": "notes"
        }
      ],
      "clinicalBooks": [
        {
          "downloadUrl": "https://www.febbox.com/share/8yiq8Tpa",
          "type": "clinical",
          "id": "essentials-cm",
          "author": "Practical",
          "title": "Essentials of CM Practical",
          "coverColor": "bg-emerald-600",
          "coverUrl": "https://m.media-amazon.com/images/I/8120yCbXBUL.jpg"
        }
      ]
    },
    "examSections": [],
    "description": "Health of a population and preventing disease.",
    "years": [3],
    "name": "Community Medicine",
    "id": "community-medicine",
    "color": "bg-green-500"
  },
  "dermatology": {
    "description": "Diagnosis and treatment of skin disorders.",
    "years": [4],
    "icon": "User",
    "materials": {
      "studyMaterials": [
        {
          "id": "prepladder-derma",
          "author": "X Edition",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/4vnQc6RI",
          "coverColor": "bg-amber-600",
          "title": "Prepladder Dermatology",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/l9Jmt0PxC4nDMFkPehnA.png"
        }
      ],
      "questionBank": [],
      "textbooks": [
        {
          "type": "textbook",
          "downloadUrl": "#",
          "author": "Khanna",
          "id": "neena",
          "coverColor": "bg-rose-500",
          "title": "Textbook of Dermatology"
        }
      ],
      "clinicalBooks": []
    },
    "examSections": [],
    "color": "bg-rose-400",
    "id": "dermatology",
    "name": "Dermatology"
  },
  "ent": {
    "id": "ent",
    "description": "Diseases of the Ear, Nose, and Throat.",
    "years": [4],
    "examSections": [
      {
        "label": "Question Bank",
        "description": "",
        "id": "question-bank"
      },
      {
        "label": "Previous Year Question Papers",
        "description": "",
        "id": "previous-year-question-papers"
      }
    ],
    "materials": {
      "caseNotesAndViva": [
        {
          "title": "ENT Notes",
          "coverColor": "bg-red-600",
          "downloadUrl": "https://drive.google.com/file/d/1Ig3Z6DZ5KAxvW0obVQJi5obCO4BSRtHo/view?usp=drive_link",
          "type": "clinical",
          "author": "Dr. Sitha Sir Notes",
          "id": "ent_case_4"
        },
        {
          "parts": [
            {
              "title": "Complications of CSOM",
              "downloadUrl": "https://drive.google.com/file/d/11cmaT15f7LUX_6kWdagX6WZPVJmB_KWl/view?usp=drive_link",
              "id": "ppt_part_1"
            },
            {
              "id": "ppt_part_2",
              "downloadUrl": "https://drive.google.com/file/d/1lsStSi-ZPO_bXWpLmI2HL5gidJ9qm_r2/view?usp=drive_link",
              "title": "Ear disease (Symptom oriented approach)"
            },
            {
              "id": "ppt_part_3",
              "downloadUrl": "https://drive.google.com/file/d/1Cr5R0_DaaadqhqT7KvhP8ej3d2QHe1N2/view?usp=drive_link",
              "title": "ENT ear practical notes"
            },
            {
              "id": "ppt_part_4",
              "downloadUrl": "https://drive.google.com/file/d/1q449bQBUe-ZioVATs6b3d_oPkx2jeRMp/view?usp=drive_link",
              "title": "nose examination and diagnosis sid"
            },
            {
              "title": "nose history sid",
              "downloadUrl": "https://drive.google.com/file/d/1j3rVciTrAlGMofIjc46bAZSwR2VpvrNx/view?usp=drive_link",
              "id": "ppt_part_5"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1GZSYVfzViyySDDW5DKqr9pgyTTUIrY4R/view?usp=drive_link",
              "title": "Symptomatology Of Throat sid",
              "id": "ppt_part_6"
            },
            {
              "id": "ppt_part_7",
              "downloadUrl": "https://drive.google.com/file/d/1FkceYyyyFikY1QgeXM8KekEiGN9SC67W/view?usp=drive_link",
              "title": "throat examination by dr Rajeswari"
            },
            {
              "id": "ppt_part_8",
              "downloadUrl": "https://drive.google.com/file/d/1qZZ4bjOZbzHHnWhwn0pdXKS-_hAggmEQ/view?usp=drive_link",
              "title": "throat history and examination by dr Vikram"
            }
          ],
          "title": "All Dr. Sitha PPTs",
          "coverColor": "bg-blue-600",
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/11cmaT15f7LUX_6kWdagX6WZPVJmB_KWl/view?usp=drive_link",
          "id": "ent_ppt_collection",
          "author": "PPTs",
          "recommendationLevel": "gold-standard"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1H4Gt71kWBrGc3qVbcI6tApBPp7C8HTZD/view?usp=drive_link",
          "type": "clinical",
          "author": "Dr. Astro",
          "id": "ent_case_1",
          "coverColor": "bg-red-600",
          "title": "Approach to ear case"
        },
        {
          "coverColor": "bg-red-600",
          "title": "Ear anatomy",
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/1FraqWaUqcG_JkuTqxy_69l6ANN5UAwYJ/view?usp=drive_link",
          "author": "Dr. Astro",
          "id": "ent_case_2"
        },
        {
          "coverColor": "bg-red-600",
          "title": "ENT 101 Probable Viva Questions",
          "author": "Dr. Astro",
          "id": "ent_case_3",
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/1G37nT1vgYSicbtqJtinIJW9CfX5iLZJW/view?usp=drive_link"
        },
        {
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/1GxZSeziTuUGdt8ZGY8R5QGZunQa5uPVd/view?usp=drive_link",
          "author": "Dr. Astro",
          "id": "ent_case_5",
          "title": "ENT viva questions bank",
          "coverColor": "bg-red-600"
        },
        {
          "id": "ent_case_6",
          "author": "Dr. Astro",
          "downloadUrl": "https://drive.google.com/file/d/11VHDpbePECT8-7rbivEHbDJQlivzgkxX/view?usp=drive_link",
          "type": "clinical",
          "coverColor": "bg-red-600",
          "title": "Key to ENT Diagnosis"
        },
        {
          "coverColor": "bg-red-600",
          "title": "Syndromes and signs in ENT",
          "id": "ent_case_7",
          "author": "Dr. Astro",
          "downloadUrl": "https://drive.google.com/file/d/1wmzwmUq0-6jckWGPNTnMppLqHvUtZ5if/view?usp=drive_link",
          "type": "clinical"
        },
        {
          "coverColor": "bg-red-600",
          "title": "Theory for major case",
          "id": "ent_case_8",
          "author": "Dr. Astro",
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/1B5ON4yzhVRDVCbOWceCYXPUlb7vZZcx8/view?usp=drive_link"
        },
        {
          "coverColor": "bg-red-600",
          "title": "Tonsillitis Viva Questions ENT",
          "author": "Dr. Astro",
          "id": "ent_case_9",
          "downloadUrl": "https://drive.google.com/file/d/1aINbFmKnUtuVQ1dY1jawlSBjeD6oOv8R/view?usp=drive_link",
          "type": "clinical"
        }
      ],
      "exam-cases": [
        {
          "coverUrl": "",
          "parts": [
            {
              "downloadUrl": "https://drive.google.com/file/d/1lPBbL4jBzlIi4kvtkDKXVLXC4sdaIxF_/view?usp=drive_link",
              "title": "Newer Version",
              "id": "2d5c9463-5017-43ec-acb4-ee26b7323e57"
            },
            {
              "id": "3cb2aa02-7def-4137-b7fa-f26a50117414",
              "title": "Untouched Version",
              "downloadUrl": "https://drive.google.com/file/d/11xXNSOyqG0PryEmVjQBoMIpXdvniFDL_/view?usp=drive_link"
            }
          ],
          "type": "textbook",
          "author": "Case Proforma",
          "coverColor": "bg-blue-600",
          "title": "ENT DETAILED Case Proforma (ALL SYMPTOMS)",
          "description": "",
          "downloadUrl": "https://drive.google.com/file/d/1lPBbL4jBzlIi4kvtkDKXVLXC4sdaIxF_/view?usp=drive_link",
          "id": "04d34ee8-afe4-4b72-a755-0388e57c809e",
          "driveId": "https://drive.google.com/file/d/1lPBbL4jBzlIi4kvtkDKXVLXC4sdaIxF_/view?usp=drive_link"
        },
        {
          "id": "6afeb86b-e81a-460f-a80c-473e0581f356",
          "downloadUrl": "https://drive.google.com/file/d/1z2iLcjcYyuQ_C26IyMNsh-LZL5Yev3JA/view?usp=drive_link",
          "driveId": "https://drive.google.com/file/d/1z2iLcjcYyuQ_C26IyMNsh-LZL5Yev3JA/view?usp=drive_link",
          "description": "",
          "coverColor": "bg-blue-600",
          "title": "All imp cases ",
          "author": "Written format",
          "type": "textbook",
          "coverUrl": ""
        },
        {
          "type": "textbook",
          "author": "PPTs",
          "coverUrl": "",
          "driveId": "https://drive.google.com/file/d/1FJmQRutXlqFyNF8epnT1A2Mn9S-ebOUR/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1FJmQRutXlqFyNF8epnT1A2Mn9S-ebOUR/view?usp=drive_link",
          "id": "f02a0027-52e2-49ed-bbbb-18b86b0d78c4",
          "coverColor": "bg-blue-600",
          "title": "All cases (PPTs)",
          "description": ""
        },
        {
          "driveId": "https://drive.google.com/file/d/139liqIV80w1avdj_wM1K8-pup4POQW80/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/139liqIV80w1avdj_wM1K8-pup4POQW80/view?usp=drive_link",
          "id": "12646c76-6be6-45e4-a99e-d9caf27735ec",
          "coverColor": "bg-blue-600",
          "title": "Case Scenarios qn charts",
          "description": "",
          "type": "textbook",
          "author": "Qn charts",
          "coverUrl": ""
        }
      ],
      "osce": [
        {
          "coverUrl": "",
          "author": "OSCE ENT",
          "type": "textbook",
          "description": "",
          "title": "OSCE ENT - Spotters, Audiogram, X-Rays & Osteology+ Sample OSCE",
          "coverColor": "bg-blue-600",
          "driveId": "https://drive.google.com/file/d/1G-Uouxq9F4JQkCqUrwftLhjsaHc-tVv7/view?usp=drive_link",
          "id": "78c1a750-9ecd-46bd-8674-7e090a9c2b33",
          "downloadUrl": "https://drive.google.com/file/d/1G-Uouxq9F4JQkCqUrwftLhjsaHc-tVv7/view?usp=drive_link"
        },
        {
          "coverColor": "bg-blue-600",
          "title": "Ans for OSCE notes (Spotters, Instruments, Audiogram, Tymphanogram & Xray)",
          "description": "",
          "driveId": "https://drive.google.com/file/d/1gmws4o2nUYjM8le69eROqU8z7bA0oBA4/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1gmws4o2nUYjM8le69eROqU8z7bA0oBA4/view?usp=drive_link",
          "id": "5139145f-0aab-44ca-b521-d121e61bb9dc",
          "coverUrl": "",
          "type": "textbook",
          "author": "OSCE Ans"
        },
        {
          "id": "f534ea86-a4f5-4435-a31d-607a49009e0b",
          "downloadUrl": "https://drive.google.com/file/d/1i6h79iPnvNyaQUqEcPyBBANvMVI48Q5l/view?usp=drive_link",
          "driveId": "https://drive.google.com/file/d/1i6h79iPnvNyaQUqEcPyBBANvMVI48Q5l/view?usp=drive_link",
          "description": "",
          "coverColor": "bg-blue-600",
          "title": "PTA & Impedence audiometry (ENT)",
          "author": "Audiometry",
          "type": "textbook",
          "coverUrl": ""
        },
        {
          "coverColor": "bg-blue-600",
          "author": "Instruments",
          "coverUrl": "",
          "id": "e6a1a454-0498-410a-b364-16a12543e51a",
          "downloadUrl": "https://drive.google.com/file/d/16A2OndZ38zG-6OltUqJ_g28f-7W_j7v6/view?usp=drive_link",
          "driveId": "https://drive.google.com/file/d/16A2OndZ38zG-6OltUqJ_g28f-7W_j7v6/view?usp=drive_link",
          "description": "",
          "type": "textbook",
          "title": "Instruments "
        },
        {
          "type": "textbook",
          "author": "X-Rays",
          "coverUrl": "",
          "driveId": "https://drive.google.com/file/d/150uXw1vMCHyXm9nK-vQ0y63y90184_00/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/150uXw1vMCHyXm9nK-vQ0y63y90184_00/view?usp=drive_link",
          "id": "e0a0a56e-897b-402a-9694-ee26b7323e57",
          "coverColor": "bg-blue-600",
          "title": "X-Rays ",
          "description": ""
        }
      ],
      "question-bank": [
        {
          "id": "ent_qb_1",
          "author": "Dr. Astro",
          "downloadUrl": "https://drive.google.com/file/d/1GxZSeziTuUGdt8ZGY8R5QGZunQa5uPVd/view?usp=drive_link",
          "type": "notes",
          "coverColor": "bg-blue-600",
          "title": "ENT QBank"
        }
      ],
      "previous-year-question-papers": [
        {
          "coverColor": "bg-blue-600",
          "title": "ENT Question Papers",
          "id": "ent_pyq_1",
          "author": "Dr. Astro",
          "type": "notes",
          "downloadUrl": "https://drive.google.com/file/d/1Fk_wzD0pYwX_6R_g_m_k_7_t_p_v_g_x/view?usp=drive_link"
        }
      ],
      "clinicalBooks": [
        {
          "recommendationLevel": "preferred",
          "type": "clinical",
          "author": "Dhingra",
          "id": "dhingra-clin",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/hP9eO6u2vL9Y7mP1v4qZ.png",
          "coverColor": "bg-emerald-600",
          "title": "Diseases of ENT (Dhingra)",
          "downloadUrl": "https://www.febbox.com/share/JkYj4Sf2"
        },
        {
          "title": "Logan Turner ENT",
          "coverColor": "bg-emerald-700",
          "downloadUrl": "https://www.febbox.com/share/m4oMzkY1",
          "author": "Standard",
          "id": "logan-turner",
          "type": "clinical",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        }
      ],
      "studyMaterials": [
        {
          "id": "marrow-ent",
          "author": "8th Edition",
          "type": "notes",
          "downloadUrl": "#",
          "title": "Marrow ENT",
          "coverColor": "bg-amber-500",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/hP9eO6u2vL9Y7mP1v4qZ.png"
        },
        {
          "author": "X Edition",
          "id": "prepladder-ent",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/XkYj4Sf2",
          "title": "Prepladder ENT",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/7g8gFBZyLKxRzFf94qle.png"
        }
      ],
      "textbooks": [
        {
          "downloadUrl": "https://www.febbox.com/share/JkYj4Sf2",
          "author": "Dhingra",
          "id": "dhingra-main",
          "type": "textbook",
          "coverColor": "bg-violet-600",
          "title": "Diseases of ENT (Dhingra)",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/hP9eO6u2vL9Y7mP1v4qZ.png"
        },
        {
          "author": "Standard",
          "id": "ent-hazarika",
          "downloadUrl": "https://www.febbox.com/share/m4oMzkY1",
          "type": "textbook",
          "coverColor": "bg-violet-500",
          "title": "Hazarika ENT",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        }
      ]
    },
    "practicalSections": [
      {
        "id": "clinicalBooks",
        "label": "Clinical Books"
      },
      {
        "id": "exam-cases",
        "label": "Clinical Proforma"
      },
      {
        "id": "caseNotesAndViva",
        "label": "Case Notes & Viva"
      },
      {
        "id": "osce",
        "label": "OSCE"
      },
      {
        "id": "practicalMaterials",
        "label": "Practical Materials"
      }
    ],
    "icon": "Ear",
    "color": "bg-violet-500",
    "name": "ENT"
  },
  "fmt": {
    "materials": {
      "textbooks": [
        {
          "coverColor": "bg-slate-700",
          "title": "Reddy's Forensic Medicine",
          "id": "reddy-fmt",
          "author": "KS Narayan Reddy",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx"
        }
      ],
      "clinicalBooks": [],
      "studyMaterials": [
        {
          "author": "X Edition",
          "id": "prepladder-fmt",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "coverColor": "bg-amber-600",
          "title": "Prepladder FMT"
        }
      ],
      "questionBank": []
    },
    "examSections": [],
    "id": "fmt",
    "name": "Forensic Medicine",
    "description": "Application of medical knowledge to investigation of crime.",
    "years": [3],
    "icon": "Skull",
    "color": "bg-slate-600"
  },
  "general-medicine": {
    "years": [4],
    "icon": "Stethoscope",
    "practicalSections": [
      {
        "id": "clinical-books",
        "label": "Clinical Books"
      },
      {
        "label": "Case Proforma",
        "id": "case-proforma"
      },
      {
        "id": "case-notes",
        "label": "Case Notes"
      },
      {
        "label": "OSCE",
        "id": "osce"
      },
      {
        "id": "viva",
        "label": "VIVA"
      }
    ],
    "description": "Diagnosis, treatment, and prevention of disease in adults.",
    "name": "General Medicine",
    "id": "general-medicine",
    "color": "bg-blue-500",
    "examSections": [
      {
        "description": "",
        "label": "Cases",
        "id": "cases"
      },
      {
        "label": "Clinical Books",
        "description": "",
        "id": "clinical-books"
      },
      {
        "id": "case-notes",
        "label": "Case Notes",
        "description": ""
      },
      {
        "label": "OSCE",
        "description": "Skilled & Unskilled OSCE\n",
        "id": "osce"
      },
      {
        "description": "",
        "label": "VIVA",
        "id": "viva"
      }
    ],
    "materials": {
      "clinicalBooks": [
        {
          "author": "Practical Medicine",
          "type": "clinical",
          "id": "alagappan",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/Tc2e0XDZhc6AmNGUKVqm.jpg",
          "downloadUrl": "https://drive.google.com/file/d/13Yhh679vpY2-yP6Q9uBNI2i3PfP0xgMT/view?usp=drive_link",
          "title": "Alagappan Manual of Practical Medicine",
          "coverColor": "bg-emerald-500"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1KE8ESOJLJYOphLl924uWnB0Ucc9-rw-V/view?usp=drive_link",
          "author": "Archith Boloor",
          "id": "boloor-clin",
          "type": "clinical",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/KXd6WIUGVeTjOwEX2EL0.jpg",
          "coverColor": "bg-emerald-600",
          "title": "Clinical Med (Boloor)"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1XFyronrEZuBu2IY731U6cAGTBLvCPM2r/view?usp=drive_link",
          "author": "24th Edition",
          "id": "hutchinson-24",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/2GssRSKi8PEoMQ6IQVUn.jpg",
          "type": "clinical",
          "title": "Hutchison's Clinical Methods",
          "coverColor": "bg-emerald-700"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1zGD10aa5KVqxnw4a1fVQaxhqbYPi077U/view?usp=drive_link",
          "type": "clinical",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/IoxTKkOA0LOtRrmacs6Z.jpg",
          "id": "macleod",
          "author": "Standard",
          "title": "Macleod's Clinical Exam",
          "coverColor": "bg-emerald-600"
        }
      ],
      "osce": [
        {
          "description": "",
          "title": "Unskilled osce ",
          "downloadUrl": "",
          "id": "c9f82108-ef34-4cf4-93e7-0f35c0d7edd5",
          "parts": [
            {
              "id": "8d02a256-94ee-4078-a182-9159a54fa055",
              "title": "Unskilled OSCE main ",
              "downloadUrl": "https://drive.google.com/file/d/1vQtg5nhTFtR1anx46H5AOh-RgNMonxtc/view?usp=drive_link"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1gQAcIDmmC_TAnKMDXQ2it0kEiYjCQJAz/view?usp=drive_link",
              "title": "Unskilled OSCE 99 pdf",
              "id": "e6950fdc-fc55-46f1-ab8e-bcefb7efa0d5"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1J-pUNj3g6eksIvenaZBjTd8jCHsGcaTY/view?usp=drive_link",
              "id": "ce7ba515-d7ba-468e-97ff-95231be301e3",
              "title": "Unskilled osce med"
            }
          ],
          "coverColor": "bg-blue-600",
          "author": "OSCE",
          "type": "textbook"
        }
      ],
      "textbooks": [
        {
          "coverColor": "bg-blue-700",
          "title": "Davidson's Principles & Practice",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/Gw2bBPXe0UnmApT4ws0q.jpeg",
          "id": "davidson-24",
          "type": "textbook",
          "author": "24th Edition",
          "downloadUrl": "https://drive.google.com/file/d/1Yt6i8DdqKqebx2GMSqXsgbC41zCD4sld/view?usp=drive_link"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1E7AjS6S0Ygn8-aE1bVWRxw8IWg7rLWHs/view?usp=drive_link",
          "author": "4th Edition",
          "type": "textbook",
          "id": "boloor-4",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/zaGvKTDIUzoP3tfkT4T1.webp",
          "title": "Exam Prep Medicine (Boloor)",
          "coverColor": "bg-blue-600"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1FI8404Qo86qz5kGDX-RgbqFck3UbTgBl/view?usp=drive_link",
          "author": "2nd Edition",
          "id": "boloor-2",
          "coverUrl": "https://m.media-amazon.com/images/I/91whfQj74hL._UF1000,1000_QL80_.jpg",
          "type": "textbook",
          "title": "Exam Prep Medicine (Boloor)",
          "coverColor": "bg-blue-600"
        },
        {
          "coverColor": "bg-blue-800",
          "title": "Harrison's Principles",
          "author": "21st Edition",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/XUu5MYYMLFSnN1SrpW9P.jpg",
          "id": "harrisons-21",
          "type": "textbook",
          "downloadUrl": "https://drive.google.com/file/d/1zIXHyBFiIJ4WSCoykmF4_oSxCAgh3mVW/view?usp=drive_link"
        },
        {
          "type": "textbook",
          "id": "manipal-3",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/2mvOkF8HpH6uFeLQNX5c.jpg",
          "author": "3rd Edition",
          "downloadUrl": "https://drive.google.com/file/d/1tynCEpsXzmxY9TktczqR78ruj3TNx9m8/view?usp=drive_link",
          "coverColor": "bg-blue-500",
          "title": "Manipal Prep Manual"
        }
      ],
      "cases": [
        {
          "description": "",
          "driveId": "https://drive.google.com/file/d/1YofBkJLHCZfp55N8oFqKvK76Ew-T6Bwa/view?usp=drive_link",
          "title": "Case Proforma Formats ",
          "downloadUrl": "https://drive.google.com/file/d/1YofBkJLHCZfp55N8oFqKvK76Ew-T6Bwa/view?usp=drive_link",
          "id": "52f6484c-b515-47c2-86f1-c4a8ced3dd9c",
          "coverColor": "bg-blue-600",
          "type": "textbook",
          "author": "Proforma"
        },
        {
          "author": "Exam Cases",
          "type": "textbook",
          "coverColor": "bg-blue-600",
          "downloadUrl": "https://drive.google.com/file/d/11opC330VgvAsKtqwiGrOk1N_4Ao8cfXF/view?usp=drive_link",
          "id": "cf4c9007-3909-4301-819b-e896d8e62f82",
          "description": "",
          "title": "All G.Med Case Files ",
          "driveId": "https://drive.google.com/file/d/11opC330VgvAsKtqwiGrOk1N_4Ao8cfXF/view?usp=drive_link"
        },
        {
          "description": "",
          "title": "Long Case Scenarios",
          "driveId": "https://drive.google.com/file/d/1lRT-yByXJitcOWsEkap6V2yk7KB_4XbK/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1lRT-yByXJitcOWsEkap6V2yk7KB_4XbK/view?usp=drive_link",
          "id": "2f52ec30-7d80-4177-9338-0184356a5843",
          "coverColor": "bg-blue-600",
          "author": "Long Cases",
          "type": "textbook"
        },
        {
          "coverColor": "bg-blue-600",
          "author": "Short Cases",
          "type": "textbook",
          "title": "Short Case Scenarios",
          "driveId": "https://drive.google.com/file/d/19Cg-fNVDM32Py_MD9Sm5mTLVZxcHT5bw/view?usp=drive_link",
          "description": "",
          "id": "e9d5df6e-8461-4b33-87ed-3127a082007a",
          "downloadUrl": "https://drive.google.com/file/d/19Cg-fNVDM32Py_MD9Sm5mTLVZxcHT5bw/view?usp=drive_link"
        }
      ],
      "viva": [
        {
          "id": "4c66fd32-070c-4ed1-ad8c-ffc5e37a4681",
          "title": "ECG",
          "description": "",
          "author": "ECG",
          "type": "textbook",
          "coverColor": "bg-blue-600",
          "parts": [
            {
              "title": "ECG Basic",
              "id": "d81717cf-b091-46ed-8e85-ff9eb04ac0aa",
              "downloadUrl": "https://drive.google.com/file/d/1x5RcrDiFR5IKy-E26GLeKkZDfHS0NjhB/view?usp=drive_link"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1Ivv3m4RF_VjecFZBo4Y5GkPUaIKpDJPe/view?usp=drive_link",
              "title": "ECG Compiled ",
              "id": "8e07aa0c-eb77-433b-b131-231a4abf3c08"
            }
          ]
        },
        {
          "description": "",
          "title": "Med Drugs",
          "driveId": "https://drive.google.com/file/d/1Flp__zD24MG_vLBhNIVkH_bB6KNCqnbq/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1Flp__zD24MG_vLBhNIVkH_bB6KNCqnbq/view?usp=drive_link",
          "id": "773a38cb-36ff-4d35-b03b-1bf580d5fe3d",
          "coverColor": "bg-blue-600",
          "author": "Drugs",
          "type": "textbook"
        },
        {
          "type": "textbook",
          "author": "Instruments",
          "coverColor": "bg-blue-600",
          "id": "fd9eb53f-e2e5-4b8f-be25-c309bf4caf0b",
          "downloadUrl": "https://drive.google.com/file/d/15VkZXnuNtlI0yrOZm4n2z7ylalA1EETJ/view?usp=drive_link",
          "driveId": "https://drive.google.com/file/d/15VkZXnuNtlI0yrOZm4n2z7ylalA1EETJ/view?usp=drive_link",
          "title": "Med Instruments",
          "description": ""
        },
        {
          "type": "textbook",
          "author": "Xray",
          "parts": [
            {
              "id": "027db0a7-4ad5-4966-b0b7-23840f0be67c",
              "title": "X-ray identify",
              "downloadUrl": "https://drive.google.com/file/d/1BOH0MdP61jDTQCZgaoxMBpQCjfFN27fH/view?usp=drive_link"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1mPjgakY0VUHHEpqkHp2MNHsygXHwqgGq/view?usp=drive_link",
              "title": "Xray Complied ",
              "id": "dd41f283-23aa-4524-8133-d7902f07932e"
            },
            {
              "title": "Xray Med",
              "id": "4113622b-1aad-4563-8b4b-287b3f71725c",
              "downloadUrl": "https://drive.google.com/file/d/1i7DBbrE29bMdYFlf_h73rxDsT04lfW7x/view?usp=drive_link"
            },
            {
              "downloadUrl": "https://drive.google.com/file/d/1mPjgakY0VUHHEpqkHp2MNHsygXHwqgGq/view?usp=drive_link",
              "id": "4a30b316-5c2f-4a8c-867d-89adbf371452",
              "title": "Xray"
            }
          ],
          "coverColor": "bg-blue-600",
          "id": "5690cf34-c31a-429a-b007-920600d3f64b",
          "description": "",
          "title": "X-Ray"
        }
      ],
      "clinical-books": [
        {
          "downloadUrl": "https://drive.google.com/file/d/1zGD10aa5KVqxnw4a1fVQaxhqbYPi077U/view?usp=drive_link",
          "author": "Standard",
          "type": "clinical",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/IoxTKkOA0LOtRrmacs6Z.jpg",
          "id": "macleod",
          "coverColor": "bg-emerald-600",
          "title": "Macleod's Clinical Exam"
        },
        {
          "title": "Alagappan Manual of Practical Medicine",
          "coverColor": "bg-emerald-500",
          "downloadUrl": "https://drive.google.com/file/d/13Yhh679vpY2-yP6Q9uBNI2i3PfP0xgMT/view?usp=drive_link",
          "author": "Practical Medicine",
          "id": "alagappan",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/Tc2e0XDZhc6AmNGUKVqm.jpg",
          "type": "clinical"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1KE8ESOJLJYOphLl924uWnB0Ucc9-rw-V/view?usp=drive_link",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/KXd6WIUGVeTjOwEX2EL0.jpg",
          "type": "clinical",
          "id": "boloor-clin",
          "author": "Archith Boloor",
          "title": "Clinical Med (Boloor)",
          "coverColor": "bg-emerald-600"
        },
        {
          "coverColor": "bg-blue-600",
          "type": "textbook",
          "coverUrl": "https://dnamart.in/cdn/shop/files/boloor_3rd_edition.jpg?v=1753950627",
          "author": "Examination Newer Edition",
          "driveId": "https://drive.google.com/file/d/1spJfWEbfpgpRUoi8_s05ZhrD_k_7Nq0B/view?usp=drive_link",
          "title": "Archit baloor Examination",
          "description": "",
          "id": "9c568967-e69e-4191-9156-0d826545cc9e",
          "downloadUrl": "https://drive.google.com/file/d/1spJfWEbfpgpRUoi8_s05ZhrD_k_7Nq0B/view?usp=drive_link"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1XFyronrEZuBu2IY731U6cAGTBLvCPM2r/view?usp=drive_link",
          "author": "24th Edition",
          "type": "clinical",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/2GssRSKi8PEoMQ6IQVUn.jpg",
          "id": "hutchinson-24",
          "title": "Hutchison's Clinical Methods",
          "coverColor": "bg-emerald-700"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1ccTFTne67ojIzfgoJbbCK2rnYnyoa3mj/view?usp=drive_link",
          "id": "bb8696a8-614f-4066-a637-d9850e0cbd09",
          "description": "",
          "title": "Medicine all practicals",
          "driveId": "https://drive.google.com/file/d/1ccTFTne67ojIzfgoJbbCK2rnYnyoa3mj/view?usp=drive_link",
          "type": "textbook",
          "author": "Other Clg",
          "coverColor": "bg-blue-600"
        }
      ],
      "questionBank": [],
      "studyMaterials": [
        {
          "author": "8th Edition",
          "type": "notes",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/GqBFXEbqoIvscsgSRjta.png",
          "id": "marrow-gen-med",
          "downloadUrl": "https://drive.google.com/file/d/15Icc-0KGV-XyOm7GBrPLLHC4vJsXaE56/view?usp=drive_link",
          "title": "Marrow General Medicine",
          "coverColor": "bg-amber-500"
        },
        {
          "downloadUrl": "https://drive.google.com/drive/folders/1GgGQwIebIkymf3drbC2G3c8MxgQDex-U?usp=drive_link",
          "id": "prepladder-gen-med",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/tXZYPkhAMT37iukSPpZM.png",
          "type": "notes",
          "author": "X Edition",
          "title": "Prepladder General Medicine",
          "coverColor": "bg-amber-600"
        }
      ],
      "case-notes": [
        {
          "description": "",
          "title": "CNS Basic Clinical Questions",
          "driveId": "https://drive.google.com/file/d/136RqOR7nMiJ2YMRsBQF6HhBFxdsa7l4l/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/136RqOR7nMiJ2YMRsBQF6HhBFxdsa7l4l/view?usp=drive_link",
          "id": "8c32ac77-64a6-4b24-bbf0-05df61b7bcae",
          "coverColor": "bg-blue-600",
          "author": "CNS",
          "type": "textbook"
        },
        {
          "coverColor": "bg-blue-600",
          "author": "CNS",
          "type": "textbook",
          "description": "",
          "title": "CNS Examination Notes",
          "driveId": "https://drive.google.com/file/d/1i6ZHkyt0nL16gll3YG8uIjvqFwWOwu99/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1i6ZHkyt0nL16gll3YG8uIjvqFwWOwu99/view?usp=drive_link",
          "id": "3f21f8a9-2e6b-485c-8e11-9723c81316f7"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1UvkYPYJN60THI8nk4ZHY9GxxVzWs-hhy/view?usp=drive_link",
          "id": "ab83eb7a-6743-4626-8771-65305e267f30",
          "description": "",
          "driveId": "https://drive.google.com/file/d/1UvkYPYJN60THI8nk4ZHY9GxxVzWs-hhy/view?usp=drive_link",
          "title": "Stroke localisation notes",
          "author": "CNS",
          "type": "textbook",
          "coverColor": "bg-blue-600"
        },
        {
          "id": "4ec6fbe8-40a8-4cc0-abf3-40ace2aa6f6c",
          "downloadUrl": "https://drive.google.com/file/d/1EWr3QxIvAvD85PnNW2dWuljEfACTqQk9/view?usp=drive_link",
          "title": "CVS Basic Clinical Questions",
          "driveId": "https://drive.google.com/file/d/1EWr3QxIvAvD85PnNW2dWuljEfACTqQk9/view?usp=drive_link",
          "description": "",
          "author": "CVS",
          "type": "textbook",
          "coverColor": "bg-blue-600"
        },
        {
          "author": "CVS",
          "type": "textbook",
          "coverColor": "bg-blue-600",
          "downloadUrl": "https://drive.google.com/file/d/12dAJKbu6wdDtFEITLgibOCdT8WAVq8h3/view?usp=drive_link",
          "id": "ad5e1048-615f-44bf-92ba-9842eecec49d",
          "description": "",
          "driveId": "https://drive.google.com/file/d/12dAJKbu6wdDtFEITLgibOCdT8WAVq8h3/view?usp=drive_link",
          "title": "CVS Examination"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1MfPNXujxudVODLtL171VkmmFY9JPh1Bs/view?usp=drive_link",
          "id": "5bab2032-9a05-4e9a-93fd-fec7bae7b3b6",
          "description": "",
          "title": "GIT Clinical Questions",
          "driveId": "https://drive.google.com/file/d/1MfPNXujxudVODLtL171VkmmFY9JPh1Bs/view?usp=drive_link",
          "author": "GIT ",
          "type": "textbook",
          "coverColor": "bg-blue-600"
        },
        {
          "coverColor": "bg-blue-600",
          "type": "textbook",
          "author": "RS",
          "title": "RS Clinical Questions",
          "driveId": "https://drive.google.com/file/d/1xykIxADmo9psF4T8wTe4OH9JvhvrB941/view?usp=drive_link",
          "description": "",
          "id": "efe5ed16-c66a-42e1-b43e-9d0d4372951d",
          "downloadUrl": "https://drive.google.com/file/d/1xykIxADmo9psF4T8wTe4OH9JvhvrB941/view?usp=drive_link"
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/1bmvH7uWE0wP6f2v3lBtz3zeBVel3ltfO/view?usp=drive_link",
          "id": "65052877-db91-45ce-b67b-d120b1b476ae",
          "description": "",
          "driveId": "https://drive.google.com/file/d/1bmvH7uWE0wP6f2v3lBtz3zeBVel3ltfO/view?usp=drive_link",
          "title": "Medicine Gradings",
          "type": "textbook",
          "author": "General",
          "coverColor": "bg-blue-600"
        },
        {
          "description": "",
          "driveId": "https://drive.google.com/file/d/1qkwicRgzuV8joEXncL6bk2xh5ogoryIA/view?usp=drive_link",
          "title": "Med - Practicals MUST KNOW",
          "downloadUrl": "https://drive.google.com/file/d/1qkwicRgzuV8joEXncL6bk2xh5ogoryIA/view?usp=drive_link",
          "id": "4887fa75-e8eb-4aa5-aadb-5222268c18c2",
          "coverColor": "bg-blue-600",
          "author": "MUST KNOW",
          "type": "textbook"
        },
        {
          "coverColor": "bg-blue-600",
          "author": "Qns",
          "type": "textbook",
          "description": "",
          "title": "Med EOP questionnaire",
          "driveId": "https://drive.google.com/file/d/1nAa5eVOvh8tne-tgfgGfKKezAfyi_y83/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1nAa5eVOvh8tne-tgfgGfKKezAfyi_y83/view?usp=drive_link",
          "id": "7c3d4db2-f275-42b5-b729-d12f8049e210"
        }
      ],
      "case-proforma": [
        {
          "id": "2e07b7d2-fcb6-4885-978d-a12c2ad2e895",
          "downloadUrl": "https://drive.google.com/file/d/11opC330VgvAsKtqwiGrOk1N_4Ao8cfXF/view?usp=drive_link",
          "title": "All G.Med Case Files ",
          "driveId": "https://drive.google.com/file/d/11opC330VgvAsKtqwiGrOk1N_4Ao8cfXF/view?usp=drive_link",
          "description": "",
          "type": "textbook",
          "author": "Complied ",
          "coverColor": "bg-blue-600"
        },
        {
          "author": "Formats ",
          "type": "textbook",
          "coverColor": "bg-blue-600",
          "id": "1da94535-72dc-4bbc-ad69-a7e7e2bc376b",
          "downloadUrl": "https://drive.google.com/file/d/1YofBkJLHCZfp55N8oFqKvK76Ew-T6Bwa/view?usp=drive_link",
          "title": "Case profoma Formats ",
          "driveId": "https://drive.google.com/file/d/1YofBkJLHCZfp55N8oFqKvK76Ew-T6Bwa/view?usp=drive_link",
          "description": ""
        },
        {
          "description": "",
          "title": "Med - Long Case Scenarios",
          "driveId": "https://drive.google.com/file/d/1lRT-yByXJitcOWsEkap6V2yk7KB_4XbK/view?usp=drive_link",
          "downloadUrl": "https://drive.google.com/file/d/1lRT-yByXJitcOWsEkap6V2yk7KB_4XbK/view?usp=drive_link",
          "id": "3807e5ef-ee44-4c22-a6ee-407b2a5d78ef",
          "coverColor": "bg-blue-600",
          "author": "Case Scenarios",
          "type": "textbook"
        },
        {
          "author": "Case Scenarios",
          "type": "textbook",
          "coverColor": "bg-blue-600",
          "id": "752e8a03-c354-4877-820e-ea50aabf7242",
          "downloadUrl": "https://drive.google.com/file/d/1T7CU7biw87Asoedz_srhftgwCJyPu0k2/view?usp=drive_link",
          "driveId": "https://drive.google.com/file/d/1T7CU7biw87Asoedz_srhftgwCJyPu0k2/view?usp=drive_link",
          "title": "Long Case Scenarios 2",
          "description": ""
        },
        {
          "downloadUrl": "https://drive.google.com/file/d/19Cg-fNVDM32Py_MD9Sm5mTLVZxcHT5bw/view?usp=drive_link",
          "id": "ba0206f6-702e-41f8-98d5-1f2902e56af1",
          "description": "",
          "driveId": "https://drive.google.com/file/d/19Cg-fNVDM32Py_MD9Sm5mTLVZxcHT5bw/view?usp=drive_link",
          "title": "Short Case Scenarios ",
          "author": "Case Scenarios",
          "type": "textbook",
          "coverColor": "bg-blue-600"
        }
      ]
    }
  },
  "general-surgery": {
    "years": [4],
    "id": "general-surgery",
    "materials": {
      "case-presentation": [],
      "osce-stations": [],
      "viva-voce": [],
      "clinical-manuals": [
        {
          "id": "bailey-28",
          "author": "28th Edition",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/JkYj4Sf2",
          "title": "Bailey & Love's Surgery",
          "coverColor": "bg-red-800",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/T8pWvL9Y7mP1v4qZ.png"
        },
        {
          "title": "SRB's Manual of Surgery",
          "coverColor": "bg-red-700",
          "id": "srb-manual",
          "author": "Standard",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/m4oMzkY1"
        },
        {
          "id": "s-das-clin",
          "author": "S Das",
          "type": "clinical",
          "downloadUrl": "https://www.febbox.com/share/XkYj4Sf2",
          "title": "Clinical Surgery (S Das)",
          "coverColor": "bg-emerald-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/hP9eO6u2vL9Y7mP1v4qZ.png"
        },
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/T8pWvL9Y7mP1v4qZ.png",
          "title": "Marrow Surgery",
          "coverColor": "bg-amber-500",
          "downloadUrl": "#",
          "type": "notes",
          "id": "marrow-surgery",
          "author": "8th Edition"
        }
      ]
    },
    "examSections": [],
    "icon": "Scissors",
    "color": "bg-rose-600",
    "name": "General Surgery",
    "description": "Surgical treatment of abdominal organs and other body systems.",
    "practicalSections": [
      {
        "id": "osce-stations",
        "label": "OSCE Stations",
        "description": "Multi-station circuit covering specimens, imaging, instruments, and surgical protocols."
      },
      {
        "id": "case-presentation",
        "label": "Case Presentation",
        "description": "Comprehensive long and short case archives including oncology, hernia, and swelling protocols."
      },
      {
        "id": "viva-voce",
        "label": "Viva Voce",
        "description": "Oral examination registry for operative steps, pathology, and systemic radiology."
      },
      {
        "id": "clinical-manuals",
        "label": "Clinical Manuals"
      }
    ]
  },
  "microbiology": {
    "name": "Microbiology",
    "materials": {
      "studyMaterials": [
        {
          "id": "marrow-micro",
          "author": "8th Edition",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "title": "Marrow Microbiology",
          "coverColor": "bg-amber-500",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        },
        {
          "title": "Prepladder Microbiology",
          "coverColor": "bg-amber-600",
          "id": "prepladder-micro",
          "author": "X Edition",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "type": "notes",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        }
      ],
      "textbooks": [
        {
          "coverColor": "bg-lime-700",
          "title": "Sastry Microbiology",
          "author": "Apurb Sastry",
          "id": "sastry-micro",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        }
      ],
      "clinicalBooks": [],
      "questionBank": []
    },
    "examSections": [],
    "icon": "Microscope",
    "color": "bg-lime-600",
    "id": "microbiology",
    "description": "Study of microscopic organisms, such as bacteria, viruses, and fungi.",
    "years": [2]
  },
  "obg": {
    "examSections": [],
    "materials": {
      "case-presentation": [],
      "osce-stations": [],
      "viva-voce": [],
      "clinical-manuals": [
        {
          "author": "8th Edition",
          "id": "marrow-obg",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "title": "Marrow OBG",
          "coverColor": "bg-amber-500",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        },
        {
          "title": "Dutta's Obstetrics",
          "coverColor": "bg-pink-600",
          "author": "DC Dutta",
          "id": "dutta-obs",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/ Ur4WqfI0"
        },
        {
          "title": "Shaw's Gynaecology",
          "coverColor": "bg-pink-700",
          "author": "Shaw",
          "id": "shaw-gyn",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx"
        }
      ]
    },
    "icon": "Baby",
    "color": "bg-purple-600",
    "id": "obg",
    "name": "Obstetrics & Gynaecology",
    "description": "Care of women during pregnancy and childbirth.",
    "years": [4],
    "practicalSections": [
      {
        "id": "case-presentation",
        "label": "Case Presentation",
        "description": "Obstetric and Gynaecologic clinical assessment protocols."
      },
      {
        "id": "osce-stations",
        "label": "OSCE stations",
        "description": "Multi-station performance and written clinical examinations."
      },
      {
        "id": "viva-voce",
        "label": "Viva Voce",
        "description": "Oral examination circuit covering maternal pelvis, fetal skull, and family planning."
      },
      {
        "id": "clinical-manuals",
        "label": "Clinical Manuals"
      }
    ]
  },
  "ophthalmology": {
    "icon": "Eye",
    "color": "bg-cyan-500",
    "name": "Ophthalmology",
    "description": "Diagnosis and treatment of eye disorders.",
    "years": [4],
    "id": "ophthalmology",
    "practicalSections": [
      {
        "id": "clinical-cases",
        "label": "Clinical Cases",
        "description": "Comprehensive diagnostic archives for Primary (Cataract) and Secondary (General) clinical assessments."
      },
      {
        "id": "viva-voce",
        "label": "Viva Voce Stations",
        "description": "High-yield oral examination protocols covering Instruments, Ocular Medications, Lenses, and AETCOM ethics."
      },
      {
        "label": "Clinical Manuals",
        "id": "clinical-manuals"
      },
      {
        "label": "Ophthalmology Blueprint",
        "id": "ophthalmology-blueprint"
      }
    ],
    "materials": {
      "clinical-cases": [
        {
          "id": "ophth_case_1",
          "author": "Dr. Astro",
          "downloadUrl": "https://drive.google.com/file/d/1B_wzD0pYwX_6R_g_m_k_7_t_p_v_g_x/view?usp=drive_link",
          "type": "clinical",
          "coverColor": "bg-blue-600",
          "title": "Approach to Cataract"
        }
      ],
      "viva-voce": [
        {
          "coverColor": "bg-blue-600",
          "author": "Spotters",
          "id": "ophth_spot_1",
          "type": "clinical",
          "downloadUrl": "https://drive.google.com/file/d/1X_wzD0pYwX_6R_g_m_k_7_t_p_v_g_x/view?usp=drive_link",
          "title": "Ophthalmology Spotters"
        }
      ],
      "clinical-manuals": [
        {
          "author": "Khurana",
          "id": "khurana-clin",
          "type": "clinical",
          "downloadUrl": "https://www.febbox.com/share/m4oMzkY1",
          "title": "Modern System of Ophthalmology",
          "coverColor": "bg-emerald-600",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        }
      ],
      "questionBank": []
    },
    "examSections": []
  },
  "orthopaedics": {
    "materials": {
      "clinicalBooks": [],
      "questionBank": [],
      "studyMaterials": [
        {
          "author": "X Edition",
          "id": "prepladder-ortho",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/ nh4oMus9",
          "title": "Prepladder Orthopaedics",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        }
      ],
      "textbooks": [
        {
          "id": "maheshwari",
          "author": "Maheshwari",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "title": "Essential Orthopaedics",
          "coverColor": "bg-stone-600"
        }
      ]
    },
    "examSections": [],
    "icon": "Bone",
    "color": "bg-stone-500",
    "id": "orthopaedics",
    "name": "Orthopaedics",
    "description": "Treatment of disorders of the bones in the body.",
    "years": [4]
  },
  "pathology": {
    "name": "Pathology",
    "materials": {
      "studyMaterials": [
        {
          "title": "Marrow Pathology",
          "coverColor": "bg-amber-500",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "id": "marrow-path",
          "author": "8th Edition",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9"
        },
        {
          "author": "X Edition",
          "id": "prepladder-path",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "title": "Prepladder Pathology",
          "coverColor": "bg-amber-600"
        }
      ],
      "textbooks": [
        {
          "author": "10th Edition",
          "id": "robbins-10",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "title": "Robbins Pathologic Basis",
          "coverColor": "bg-pink-700",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        },
        {
          "title": "Harsh Mohan Pathology",
          "coverColor": "bg-pink-600",
          "id": "harsh-mohan",
          "author": "Harsh Mohan",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx"
        }
      ],
      "clinicalBooks": [],
      "questionBank": []
    },
    "examSections": [],
    "icon": "Microscope",
    "color": "bg-pink-600",
    "id": "pathology",
    "description": "The study of the causes and effects of disease or injury.",
    "years": [2]
  },
  "pediatrics": {
    "years": [4],
    "description": "Medical care of infants, children, and adolescents.",
    "materials": {
      "case-presentation": [
        {
          "id": "peds-neonatal",
          "title": "Neonatal Clinical Track",
          "author": "Normal & Jaundice",
          "type": "clinical",
          "coverColor": "bg-sky-600",
          "description": "Comprehensive protocols for Normal Newborn assessment and Neonatal Jaundice management.",
          "downloadUrl": "#"
        },
        {
          "id": "peds-clinical",
          "title": "Pediatric Clinical Track",
          "author": "CP, AFP, ADHD, Nephrotic",
          "type": "clinical",
          "coverColor": "bg-sky-500",
          "description": "Clinical guidelines for Cerebral Palsy, AFP, Behavioral Disorders, and Nephrotic Syndrome.",
          "downloadUrl": "#"
        },
        {
          "id": "peds-systemic",
          "title": "Systemic Case Registry",
          "author": "CVS, RS, GIT",
          "type": "clinical",
          "coverColor": "bg-sky-700",
          "description": "High-yield systemic clinical case scenarios for Pediatrics.",
          "downloadUrl": "#"
        }
      ],
      "osce-stations": [
        {
          "id": "peds-osce-written",
          "title": "OSCE Written Circuit",
          "author": "5 Stations",
          "type": "clinical",
          "coverColor": "bg-sky-400",
          "description": "Multi-station circuit for written OSCE assessments.",
          "downloadUrl": "#"
        }
      ],
      "viva-voce": [
        {
          "id": "peds-viva-main",
          "title": "Viva Voce Master Registry",
          "author": "Instruments & Drugs",
          "type": "clinical",
          "coverColor": "bg-sky-800",
          "description": "Oral examination protocols for Pediatric Instruments, Vaccines, and X-ray interpretation.",
          "downloadUrl": "#"
        },
        {
          "id": "peds-counselling",
          "title": "Nutrition & Counselling",
          "author": "Breastfeeding",
          "type": "clinical",
          "coverColor": "bg-sky-600",
          "description": "Counselling protocols for Breastfeeding and nutritional assessments.",
          "downloadUrl": "#"
        }
      ],
      "clinical-manuals": [
        {
          "coverColor": "bg-sky-500",
          "title": "Ghai Essential Pediatrics",
          "author": "OP Ghai",
          "id": "ghai-peds",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0"
        },
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "title": "Marrow Pediatrics",
          "coverColor": "bg-amber-500",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "id": "marrow-peds",
          "author": "8th Edition",
          "type": "notes"
        }
      ]
    },
    "examSections": [],
    "icon": "Baby",
    "color": "bg-sky-400",
    "id": "pediatrics",
    "name": "Pediatrics",
    "practicalSections": [
      {
        "id": "case-presentation",
        "label": "Case Presentation",
        "description": "Clinical assessment tracks for Neonatal and Pediatric systemic cases."
      },
      {
        "id": "osce-stations",
        "label": "OSCE Circuit",
        "description": "Standardized written clinical examination stations."
      },
      {
        "id": "viva-voce",
        "label": "Viva Voce",
        "description": "Oral examination registry for instruments, drugs, vaccines, and nutrition counselling."
      },
      {
        "id": "clinical-manuals",
        "label": "Clinical Manuals"
      }
    ]
  },
  "pharmacology": {
    "name": "Pharmacology",
    "materials": {
      "studyMaterials": [
        {
          "id": "marrow-pharm",
          "author": "8th Edition",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "coverColor": "bg-amber-500",
          "title": "Marrow Pharmacology"
        },
        {
          "author": "X Edition",
          "id": "prepladder-pharm",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png",
          "title": "Prepladder Pharmacology",
          "coverColor": "bg-amber-600"
        }
      ],
      "textbooks": [
        {
          "coverColor": "bg-teal-600",
          "title": "KDT Pharmacology",
          "author": "KD Tripathi",
          "id": "kdt-pharm",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        },
        {
          "id": "grg-pharm",
          "author": "Govind Rai Garg",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx",
          "title": "Review of Pharmacology",
          "coverColor": "bg-teal-500"
        }
      ],
      "clinicalBooks": [],
      "questionBank": []
    },
    "examSections": [],
    "icon": "Pill",
    "color": "bg-teal-500",
    "id": "pharmacology",
    "description": "The study of drug action and interaction.",
    "years": [2]
  },
  "physiology": {
    "materials": {
      "previousYearQuestions": [
        {
          "coverColor": "bg-orange-600",
          "title": "Physiology PYQs",
          "id": "physio-pyq-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "textbook"
        }
      ],
      "practicalMaterials": [
        {
          "coverColor": "bg-orange-600",
          "title": "Physiology Practical Resources",
          "type": "textbook",
          "downloadUrl": "https://t.me/DrAstroBot",
          "author": "@DrAstroBot",
          "id": "physio-prac-tg"
        }
      ],
      "questionBank": [
        {
          "coverColor": "bg-orange-600",
          "title": "Physiology Q-Bank",
          "id": "physio-qb-tg",
          "author": "@DrAstroBot",
          "downloadUrl": "https://t.me/DrAstroBot",
          "type": "question-bank"
        }
      ],
      "clinicalBooks": [],
      "studyMaterials": [
        {
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/R7mP1v4qZT8pWvL9Y7mP.png",
          "title": "Marrow Physiology",
          "coverColor": "bg-amber-500",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9",
          "type": "notes",
          "id": "marrow-physio",
          "author": "8th Edition"
        },
        {
          "title": "Prepladder Physiology",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/T8pWvL9Y7mP1v4qZ.png",
          "author": "X Edition",
          "id": "prepladder-physio",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/nh4oMus9"
        }
      ],
      "textbooks": [
        {
          "id": "guyton",
          "author": "Guyton & Hall",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "title": "Textbook of Physiology",
          "coverColor": "bg-orange-700",
          "coverUrl": "https://m.media-amazon.com/images/I/51A4xoiHazL.jpg"
        },
        {
          "title": "GK Pal Physiology",
          "coverColor": "bg-orange-600",
          "id": "gk-pal",
          "author": "GK Pal",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/rk9DzkEx"
        }
      ]
    },
    "examSections": [],
    "icon": "Activity",
    "color": "bg-orange-500",
    "id": "physiology",
    "name": "Physiology",
    "description": "Study of the functions of living organisms and their parts.",
    "years": [1]
  },
  "psychiatry": {
    "description": "Diagnosis and treatment of mental disorders.",
    "years": [4],
    "icon": "Brain",
    "materials": {
      "clinicalBooks": [],
      "questionBank": [],
      "studyMaterials": [
        {
          "author": "X Edition",
          "id": "prepladder-psych",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/ nh4oMus9",
          "title": "Prepladder Psychiatry",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        }
      ],
      "textbooks": [
        {
          "id": "niraj-ahuja",
          "author": "Niraj Ahuja",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "title": "Short Textbook of Psychiatry",
          "coverColor": "bg-purple-600"
        }
      ]
    },
    "examSections": [],
    "color": "bg-purple-500",
    "id": "psychiatry",
    "name": "Psychiatry"
  },
  "radiology": {
    "materials": {
      "clinicalBooks": [],
      "questionBank": [],
      "studyMaterials": [
        {
          "author": "X Edition",
          "id": "prepladder-radio",
          "type": "notes",
          "downloadUrl": "https://www.febbox.com/share/ nh4oMus9",
          "title": "Prepladder Radiology",
          "coverColor": "bg-amber-600",
          "coverUrl": "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/jogRQQ7NL14vh4LDNK8n/pub/8WuFdOFnoBqwaVKEteqH.png"
        }
      ],
      "textbooks": [
        {
          "id": "radio-review",
          "author": "Standard",
          "type": "textbook",
          "downloadUrl": "https://www.febbox.com/share/Ur4WqfI0",
          "title": "Review of Radiology",
          "coverColor": "bg-indigo-600"
        }
      ]
    },
    "examSections": [],
    "icon": "Zap",
    "color": "bg-indigo-500",
    "id": "radiology",
    "name": "Radiology",
    "description": "Medical imaging for diagnosis and treatment of disease.",
    "years": [4]
  }
} as any;



/**
 * ==========================================
 * MOCK AUTH SERVICE
 * ==========================================
 */
/**
 * ==========================================
 * ADMIN CONFIGURATION
 * ==========================================
 */
const ADMIN_EMAILS = [
    'drastrobot@gmail.com',
    'sathyavengats2011@gmail.com',
    'deivarajan9709sanjay@gmail.com',
    'ramyachockalingam777@gmail.com',
    '123@123'
];

const SUPER_ADMIN_EMAILS = [
    'drastrobot@gmail.com',
    'sathyavengats2011@gmail.com',
    'deivarajan9709sanjay@gmail.com',
    'ramyachockalingam777@gmail.com',
    '123@123'
];

const AuthService = {
    STORAGE_KEY: 'dr-astro-users',
    SESSION_KEY: 'dr-astro-session',

    getUsers: (): AppUser[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(AuthService.STORAGE_KEY);
        if (!stored) {
            const admin: AppUser = {
                id: 'admin-1',
                name: 'Dr. Astro Admin',
                email: '123@123',
                password: '123',
                role: 'admin',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrAstroAdmin',
                joinedAt: new Date().toISOString()
            };
            const botAdmin: AppUser = {
                id: 'admin-bot',
                name: 'Dr. Astro Bot',
                email: 'drastrobot@gmail.com',
                password: 'admin', // Placeholder if needed
                role: 'admin',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=drastrobot',
                joinedAt: new Date().toISOString()
            };
            localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify([admin, botAdmin]));
            return [admin, botAdmin];
        }
        return JSON.parse(stored);
    },

    // Centralized Firestore Sync
    syncUserToFirestore: async (user: AppUser) => {
        try {
            const userRef = doc(db, 'users', user.id);
            // Don't save password to Firestore for security
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...safeUser } = user;

            // Status Logic: Define 'dead' as > 30 days, 'inactive' as > 7 days
            let status: 'active' | 'inactive' | 'dead' = user.status || 'active';
            if (user.lastLoginAt) {
                const lastLogin = new Date(user.lastLoginAt).getTime();
                const now = new Date().getTime();
                const diffDays = (now - lastLogin) / (1000 * 3600 * 24);
                if (diffDays > 30) status = 'dead';
                else if (diffDays > 7) status = 'inactive';
                else status = 'active';
            }

            await setDoc(userRef, {
                ...safeUser,
                status,
                lastSeenAt: new Date().toISOString()
            }, { merge: true });
        } catch (err) {
            console.error('Error syncing user to Firestore:', err);
        }
    },

    addUser: async (user: AppUser) => {
        const users = AuthService.getUsers();
        if (users.find(u => u.email === user.email)) throw new Error('User already exists');

        if (!user.avatarUrl) {
            const seed = user.email.split('@')[0];
            user.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        }

        users.push(user);
        localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(users));
        await AuthService.syncUserToFirestore(user);
    },

    login: async (email: string, pass: string): Promise<AppUser | null> => {
        const users = AuthService.getUsers();
        let user = users.find(u => u.email === email && u.password === pass);
        
        if (user) {
            // Check cloud first for most recent data
            try {
                const cloudUser = await AuthService.getUserByEmail(email);
                if (cloudUser) {
                    user = { ...user, ...cloudUser };
                }
            } catch (e) { console.warn("Cloud sync failed on login", e); }

            if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
                user.role = 'admin';
            }
            user.lastLoginAt = new Date().toISOString();
            const otherUsers = users.filter(u => u.id !== user!.id);
            localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify([...otherUsers, user]));
            localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(user));
            await AuthService.syncUserToFirestore(user); 
            return user;
        }
        return null;
    },

    directLogin: (user: AppUser) => {
        const users = AuthService.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            user.role = 'admin';
        }
        user.lastLoginAt = new Date().toISOString();

        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }

        localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(user));
        AuthService.syncUserToFirestore(user); // Async
        return user;
    },

    deleteUser: async (userId: string) => {
        const users = AuthService.getUsers();
        const newUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(newUsers));
        try {
            await deleteDoc(doc(db, 'users', userId));
        } catch (err) {
            console.error('Error deleting from Firestore:', err);
        }
    },

    getCurrentUser: (): AppUser | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(AuthService.SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    updateUser: async (updatedUser: AppUser) => {
        if (typeof window === 'undefined') return;

        const users = AuthService.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(users));
        }

        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id === updatedUser.id) {
            localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(updatedUser));
        }
        
        // SYNC_CORE: Wait for Firestore to guarantee "Lifelong Storage"
        await AuthService.syncUserToFirestore(updatedUser);
    },

    getAllUsersCentralized: async (): Promise<AppUser[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const rawUsers: AppUser[] = [];
            querySnapshot.forEach((doc) => {
                rawUsers.push(doc.data() as AppUser);
            });

            const usersToUse = rawUsers.length > 0 ? rawUsers : AuthService.getUsers();

            // Merge duplicate users by email
            const mergedMap = new Map<string, AppUser>();
            usersToUse.forEach(u => {
                const email = (u.email || '').toLowerCase().trim();
                if (!email) {
                    mergedMap.set(u.id, u); // Keep users without email as separate
                    return;
                }

                if (mergedMap.has(email)) {
                    const existing = mergedMap.get(email)!;
                    // Merge logic: pick admin role if either is admin, most recent login, most complete data
                    const isExistingAdmin = existing.role === 'admin';
                    const isNewAdmin = u.role === 'admin';

                    const existingUpdate = existing.lastLoginAt ? new Date(existing.lastLoginAt).getTime() : 0;
                    const newUpdate = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0;

                    if (isNewAdmin && !isExistingAdmin) {
                        // Priority to admin account
                        mergedMap.set(email, { ...existing, ...u });
                    } else if (newUpdate > existingUpdate) {
                        // Priority to more recently active account
                        mergedMap.set(email, { ...existing, ...u });
                    } else {
                        // Merge fields if missing in existing
                        mergedMap.set(email, {
                            ...u,
                            ...existing,
                            role: isExistingAdmin || isNewAdmin ? 'admin' : 'user',
                            recentlyViewed: Array.from(new Set([...(existing.recentlyViewed || []), ...(u.recentlyViewed || [])]))
                        });
                    }
                } else {
                    mergedMap.set(email, u);
                }
            });

            return Array.from(mergedMap.values());
        } catch (err) {
            console.error('Error fetching centralized users:', err);
            return AuthService.getUsers();
        }
    },

    logout: () => {
        localStorage.removeItem(AuthService.SESSION_KEY);
    },

    // Optimized single user fetch
    getUserByEmail: async (email: string): Promise<AppUser | null> => {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data() as AppUser;
            }
            return null;
        } catch (err) {
            console.error('Error fetching user by email:', err);
            return null;
        }
    },

    resetAllGlobalStats: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const promises = querySnapshot.docs.map(async (userDoc) => {
                const userData = userDoc.data();
                const userRef = doc(db, 'users', userDoc.id);

                const updates: any = {
                    studyHistory: [],
                    studySessions: [],
                    studyTasks: []
                };

                if (userData.studySubjects && Array.isArray(userData.studySubjects)) {
                    updates.studySubjects = userData.studySubjects.map((s: any) => ({
                        ...s,
                        totalTime: 0
                    }));
                }

                return updateDoc(userRef, updates);
            });
            await Promise.all(promises);
        } catch (err) {
            console.error('Error resetting all global stats:', err);
        }
    },

    isProfileComplete: (user: AppUser | null | undefined): boolean => {
        if (!user) return false;
        // Required fields for a 'complete' professional profile
        return !!(
            user.name && 
            user.email && 
            user.phone && 
            user.college && 
            user.yearOfStudy && 
            user.batchYear
        );
    }
};

/**
 * ==========================================
 * ACTIVITY TRACKING SERVICE
 * ==========================================
 */
const ActivityService = {
    log: async (user: AppUser | null, action: UserActivity['action'], targetId: string, targetName: string) => {
        if (!user) return;
        try {
            const activity: UserActivity = {
                userId: user.id,
                userName: user.name,
                action,
                targetId,
                targetName,
                timestamp: new Date().toISOString()
            };

            // Log to central collection
            const actRef = doc(collection(db, 'activities'));
            await setDoc(actRef, activity);

            // Update user specific metadata (Recently Viewed, etc)
            const updates: any = { lastActiveAt: activity.timestamp, status: 'active' };
            if (action === 'view_book') {
                const recent = user.recentlyViewed || [];
                updates.recentlyViewed = [targetId, ...recent.filter(id => id !== targetId)].slice(0, 10);
            }

            await updateDoc(doc(db, 'users', user.id), updates);

            // Update local session if it matches
            const current = AuthService.getCurrentUser();
            if (current && current.id === user.id) {
                const updated = { ...current, ...updates };
                localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(updated));
            }
        } catch (err) {
            console.error('Error logging activity:', err);
        }
    },

    getActivities: async (limitCount = 100): Promise<UserActivity[]> => {
        try {
            const q = query(collection(db, 'activities'), limit(limitCount));
            const snap = await getDocs(q);
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserActivity));
            return docs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (err) {
            console.error('Error fetching activities:', err);
            return [];
        }
    },

    getUserActivities: async (userId: string, limitCount = 50): Promise<UserActivity[]> => {
        try {
            const q = query(collection(db, 'activities'), where('userId', '==', userId), limit(limitCount));
            const snap = await getDocs(q);
            // Client-side sort if composite index is missing (safest for now)
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserActivity));
            return docs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (err) {
            console.error('Error fetching user activities:', err);
            return [];
        }
    }
};

/**
 * ==========================================
 * FEEDBACK & RESOURCE REQUEST SERVICE
 * ==========================================
 */
const FeedbackService = {
    submit: async (user: AppUser | null, message: string) => {
        try {
            const feedback = {
                userId: user?.id || 'anonymous',
                userName: user?.name || 'Anonymous Student',
                userEmail: user?.email || 'N/A',
                message,
                status: 'pending',
                timestamp: new Date().toISOString()
            };
            const ref = doc(collection(db, 'feedback'));
            await setDoc(ref, feedback);
            return true;
        } catch (err) {
            console.error('Error submitting feedback:', err);
            return false;
        }
    },
    getFeedback: async (): Promise<any[]> => {
        try {
            const snap = await getDocs(query(collection(db, 'feedback'), limit(50)));
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (err) {
            console.error('Error fetching feedback:', err);
            return [];
        }
    }
};

/**
 * ==========================================
 * UTILITY HOOKS
 * ==========================================
 */

// Hook: Manage User Study Time
function useStudyTime() {
    const [minutes, setMinutes] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dr-astro-study');
            const data = stored ? JSON.parse(stored) : null;
            const today = new Date().toISOString().split('T')[0];
            if (data && data.lastDate === today) return data.todayMinutes || 0;
        }
        return 0;
    });

    const [streak] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dr-astro-study');
            if (stored) {
                const data = JSON.parse(stored);
                const lastDate = data.lastDate;
                if (!lastDate) return 1;
                
                const today = new Date();
                today.setHours(0,0,0,0);
                const last = new Date(lastDate);
                last.setHours(0,0,0,0);
                
                const diffTime = Math.abs(today.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 0) return data.streak || 1; // Same day
                if (diffDays === 1) return (data.streak || 1) + 1; // Next day increment
                return 1; // Streak broken
            }
        }
        return 1;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setMinutes((prev: number) => {
                const newVal = prev + 1;
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('dr-astro-study', JSON.stringify({
                    todayMinutes: newVal,
                    streak: streak,
                    lastDate: today
                }));
                return newVal;
            });
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [streak]);

    return { minutes, streak };
}

// Hook: Recently Viewed Books
function useRecentlyViewed() {
    const [recentIds, setRecentIds] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dr-astro-recent');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    const addRecent = (bookId: string) => {
        const newSet = [bookId, ...recentIds.filter(id => id !== bookId)].slice(0, 5);
        setRecentIds(newSet);
        localStorage.setItem('dr-astro-recent', JSON.stringify(newSet));
    };

    return { recentIds, addRecent };
}

// Hook: Quiz Performance
function useQuizPerformance() {
    const [stats, setStats] = useState<Record<string, number>>(() => {
        if (typeof window !== 'undefined') {
            const storedStats = localStorage.getItem('dr-astro-performance-stats');
            if (storedStats) return JSON.parse(storedStats);
        }
        // Mock initial data for visualization
        return {
            'general-medicine': 75,
            'anatomy': 60,
            'pathology': 85,
            'pharmacology': 40
        };
    });
    const [history, setHistory] = useState<{ subjectId: string, score: number, date: string }[]>([]);

    const saveScore = (subjectId: string, score: number) => {
        const currentAvg = stats[subjectId] || 0;
        // Simple mock average update
        const newAvg = currentAvg === 0 ? score : Math.round((currentAvg + score) / 2);
        const newStats = { ...stats, [subjectId]: newAvg };
        setStats(newStats);

        // Mock history update
        const newHistory = [...history, { subjectId, score, date: new Date().toISOString() }];
        setHistory(newHistory);

        localStorage.setItem('dr-astro-performance-stats', JSON.stringify(newStats));
    };

    return { stats, history, saveScore };
}


/**
 * ==========================================
 * MOCK GENKIT FLOWS
 * ==========================================
 */

// Simulates generateQuiz Genkit Flow
const generateQuizFlow = (subjectId: string, count: number): QuizQuestion[] => {
    // In a real app, this calls an AI model. Here we mock it.
    const pool = [
        { q: "What is the first line treatment for anaphylaxis?", o: ["Steroids", "Antihistamines", "Adrenaline", "Fluids"], a: 2, e: "Adrenaline is the life-saving medication for anaphylaxis." },
        { q: "Which cranial nerve is responsible for vision?", o: ["CN I", "CN II", "CN III", "CN IV"], a: 1, e: "CN II (Optic Nerve) transmits visual information." },
        { q: "What is the powerhouse of the cell?", o: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"], a: 1, e: "Mitochondria generate most of the cell's supply of ATP." },
        { q: "Which organ produces insulin?", o: ["Liver", "Pancreas", "Spleen", "Kidney"], a: 1, e: "Beta cells in the Pancreas produce insulin." },
        { q: "Normal pH range of human blood is:", o: ["7.0-7.2", "7.35-7.45", "7.5-7.6", "6.8-7.0"], a: 1, e: "The physiological pH is tightly regulated between 7.35 and 7.45." },
    ];

    // Randomize
    return Array.from({ length: count }).map((_, i) => {
        const item = pool[i % pool.length];
        return {
            id: `mock_${i}`,
            question: `${item.q} (${subjectId} context)`,
            options: item.o,
            correctIndex: item.a,
            explanation: item.e
        };
    });
};

/**
 * ==========================================
 * GLOBAL SEARCH COMPONENT
 * ==========================================
 */
const GlobalSearch = ({ isOpen, onClose, subjects, onSelect }: { 
    isOpen: boolean, 
    onClose: () => void, 
    subjects: Record<string, SubjectData>,
    onSelect: (type: 'subject' | 'book', id: string, subId?: string) => void
}) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const found: any[] = [];

        Object.values(subjects).forEach(s => {
            if (s.name.toLowerCase().includes(q)) {
                found.push({ type: 'subject', id: s.id, name: s.name, description: 'Subject' });
            }
            Object.entries(s.materials).forEach(([secId, books]: [string, any]) => {
                books.forEach((b: Book) => {
                    if (b.title.toLowerCase().includes(q)) {
                        found.push({ type: 'book', id: b.id, name: b.title, subId: s.id, description: `${s.name} > ${secId.replace(/([A-Z])/g, ' $1').trim()}` });
                    }
                });
            });
        });
        return found.slice(0, 10);
    }, [query, subjects]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Search className="text-zinc-500" size={20} />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search books, clinical cases, or subjects... (ESC to close)"
                        className="flex-1 bg-transparent border-none text-white outline-none text-lg placeholder:text-zinc-700"
                        onKeyDown={e => e.key === 'Escape' && onClose()}
                    />
                    <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-500 font-bold">ESC</div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length > 0 ? (
                        results.map((r, i) => (
                            <button 
                                key={i}
                                onClick={() => { onSelect(r.type, r.id, r.subId); onClose(); }}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-red-500 transition-colors">
                                        {r.type === 'subject' ? <LayoutGrid size={18} /> : <BookOpen size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-tight">{r.name}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{r.description}</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                            </button>
                        ))
                    ) : query ? (
                        <div className="p-12 text-center text-zinc-500 uppercase font-black text-[10px] tracking-widest">No neural matches found</div>
                    ) : (
                        <div className="p-8 text-center text-zinc-700 uppercase font-bold text-[9px] tracking-[0.3em]">Start typing to scan the matrix...</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

/**
 * ==========================================
 * BATCH RESOURCE UPLOAD SERVICE
 * ==========================================
 */
const BatchUploadService = {
    parseAndUpload: async (file: File, subjects: Record<string, SubjectData>, updateSubjects: (s: any) => void) => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Assume format: { subjectId: string, sectionId: string, books: Book[] }[]
            const newSubjects = { ...subjects };
            let count = 0;

            if (Array.isArray(data)) {
                data.forEach(entry => {
                    if (newSubjects[entry.subjectId]) {
                        const current = newSubjects[entry.subjectId].materials[entry.sectionId] || [];
                        newSubjects[entry.subjectId].materials[entry.sectionId] = [...current, ...entry.books];
                        count += entry.books.length;
                    }
                });
                updateSubjects(newSubjects);
                return { success: true, count };
            }
            return { success: false, error: 'Invalid format' };
        } catch (err) {
            console.error('Batch upload error:', err);
            return { success: false, error: 'JSON parse failed' };
        }
    }
};


const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

// Dr. Astro Chat Flow using Gemini
// const getAIAssistantResponse = getGeminiResponse;

/**
 * ==========================================
 * COMPONENTS
 * ==========================================
 */

const Header = ({ 
    currentView, 
    setView, 
    theme, 
    toggleTheme, 
    userAvatar, 
    isFocusMode, 
    toggleFocusMode 
}: {
    currentView: ViewState,
    setView: (v: ViewState) => void,
    theme: 'light' | 'dark',
    toggleTheme: () => void,
    userAvatar?: string,
    isFocusMode: boolean,
    toggleFocusMode: () => void
}) => {
    const navItems = [
        { label: 'Home', view: 'HOME', icon: Home },
        { label: 'Books', view: 'THEORY', icon: BookOpen },
        { label: 'Exams', view: 'EXAM_PREP', icon: GraduationCap },
        { label: 'Neural Lab', view: 'NEURAL_LAB', icon: Cpu },
        { label: 'Profile', view: 'PROFILE', icon: User }
    ];

    const isItemActive = (view: string) => {
        if (view === currentView) return true;
        if (view === 'THEORY' && currentView === 'SUBJECT_DETAIL') return true;
        if (view === 'EXAM_PREP' && (currentView === 'QUIZ' || currentView === 'EXAM_PREP')) return true;
        return false;
    };

    return (
        <>
            {/* Top Navigation: Desktop Only — 3D Glass Header */}
            <header className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center px-4 pointer-events-none">
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex items-center gap-8 pointer-events-auto max-w-5xl w-auto transition-all group/header"
                    style={{
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Scanning Line on Header */}
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <div className="w-1 h-full bg-gradient-to-b from-transparent via-red-500/40 to-transparent absolute left-0 animate-scan-horizontal opacity-0 group-hover/header:opacity-100" />
                    </div>

                    {/* Dynamic Back Button - Premium Aesthetic */}
                    <AnimatePresence>
                        {['SUBJECT_DETAIL', 'PRACTICAL_SUBJECT_DETAIL', 'EXAM_SUBJECT_DETAIL', 'QUIZ', 'NEURAL_LAB'].includes(currentView) && (
                            <motion.button
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onClick={() => window.history.back()}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white transition-all border border-white/10 ml-2 group/back shadow-lg shadow-black/20"
                                title="Go Back"
                            >
                                <ArrowLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Logo Area with Neural Glow */}
                    <div className="flex items-center gap-3 px-3 cursor-pointer group/logo" onClick={() => setView('HOME')}>
                        <div className="relative w-11 h-11 flex items-center justify-center bg-black rounded-full shadow-[0_0_20px_rgba(220,38,38,0.2)] overflow-hidden group-hover/logo:rotate-[360deg] transition-all duration-1000 border border-white/20">
                            <Image src="/app-logo.jpg" alt="Dr. Astro" fill className="object-cover" />
                            <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-black text-xl tracking-tighter text-white group-hover/logo:text-red-500 transition-colors leading-none">
                                DR. ASTRO
                            </span>
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-red-500/60 mt-0.5">Neural Hub</span>
                        </div>
                    </div>

                    {/* Nav Items - Premium Neural Style */}
                    <nav className="flex items-center p-1.5 bg-white/5 rounded-full border border-white/10 gap-1.5 relative shadow-inner">
                        {navItems.filter(i => i.view !== 'PROFILE').map((item) => {
                            const active = isItemActive(item.view as ViewState);
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => setView(item.view as ViewState)}
                                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 relative flex items-center gap-2.5 group/nav
                                        ${active 
                                            ? 'text-white bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                                            : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
                                >
                                    <item.icon size={14} className={`${active ? 'text-white' : 'group-hover/nav:scale-110 transition-transform'}`} />
                                    <span>{item.label}</span>
                                    {active && (
                                        <motion.div 
                                            layoutId="nav-glow"
                                            className="absolute inset-0 bg-red-400/20 blur-md rounded-full -z-10"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Action Hub */}
                    <div className="flex items-center gap-3 px-3 border-l border-white/10">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/10 group/btn"
                        >
                            {theme === 'dark' ? <Sun size={18} className="group-hover:rotate-90 transition-transform" /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={toggleFocusMode}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10 relative overflow-hidden group/focus
                                ${isFocusMode ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/15'}`}
                        >
                            <Timer size={18} className={isFocusMode ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            {isFocusMode && (
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            )}
                        </button>

                        <div
                            onClick={() => setView('PROFILE')}
                            className={`group/prof relative w-12 h-12 rounded-2xl p-0.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xl
                                ${isItemActive('PROFILE') ? 'bg-red-600 shadow-red-600/30' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            <div className="w-full h-full rounded-[0.8rem] overflow-hidden relative bg-zinc-800 flex items-center justify-center border border-white/10">
                                {userAvatar ? <Image src={userAvatar} alt="Profile" fill className="object-cover" /> : <User size={20} className="text-zinc-500" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/prof:opacity-100 transition-opacity" />
                            </div>
                            </div>
                    </div>
                </motion.div>
            </header>
        </>
    );
};
const AIChat = ({ currentView = 'HOME', subjects }: { currentView?: ViewState, subjects: Record<string, SubjectData> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'year' | 'subject' | 'chat'>('year');
    const [context, setContext] = useState({ year: '', subject: '' });
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I'm Dr. Astro. To help you better, which year are you in?", timestamp: new Date() }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!query.trim()) return;

        // User Message
        const userMsg: ChatMessage = { role: 'user', text: query, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsTyping(true);

        // Logic Flow
        if (step === 'year') {
            setTimeout(() => {
                setContext(prev => ({ ...prev, year: userMsg.text }));
                setStep('subject');
                setMessages(prev => [...prev, { role: 'model', text: "Got it. Which subject are you studying right now?", timestamp: new Date() }]);
                setIsTyping(false);
            }, 600);
        } else if (step === 'subject') {
            setTimeout(() => {
                setContext(prev => ({ ...prev, subject: userMsg.text }));
                setStep('chat');
                setMessages(prev => [...prev, { role: 'model', text: `Excellent. I'm ready to help with ${userMsg.text}. Ask me anything!`, timestamp: new Date() }]);
                setIsTyping(false);
            }, 600);
        } else {
            // Chat Step
            const response = await getGeminiResponse(context.year, context.subject, userMsg.text, subjects);
            setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
            setIsTyping(false);
        }
    };



    return (
        <>
            {/* Trigger Button - Position adjusted to stay above bottom nav */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed ${currentView === 'STUDY_MODE' ? 'bottom-24 right-4 md:bottom-28 md:right-8' : 'bottom-24 right-4 md:bottom-28 md:right-8'} w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <Brain size={28} />
            </button>

            {/* Chat Dialog */}
            {isOpen && (
                <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 sm:w-96 sm:h-[500px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 backdrop-blur-sm">
                    {/* Header */}
                    <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Brain size={20} />
                            <span className="font-bold">Dr. Astro</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-red-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={step === 'year' ? "e.g. 3" : step === 'subject' ? "e.g. Pathology" : "Ask Dr. Astro..."}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!query.trim()}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// 2. Subject Icon Component
const SubjectIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
    const props = { size, className };
    switch (name) {
        case 'Stethoscope': return <Stethoscope {...props} />;
        case 'Microscope': return <Microscope {...props} />;
        case 'Activity': return <Activity {...props} />;
        case 'Eye': return <Eye {...props} />;
        case 'Bone': return <Bone {...props} />;
        case 'Baby': return <Baby {...props} />;
        case 'Syringe': return <Syringe {...props} />;
        case 'Pill': return <Pill {...props} />;
        case 'Skull': return <Skull {...props} />;
        case 'Users': return <Users {...props} />;
        case 'Scissors': return <Scissors {...props} />;
        case 'Zap': return <Zap {...props} />;
        case 'HeartPulse': return <HeartPulse {...props} />;
        case 'Ear': return <Ear {...props} />;
        case 'Brain': return <Brain {...props} />;
        case 'User': return <User {...props} />;
        default: return <BookOpen {...props} />;
    }
};

// 3. Subject Card Component
const SubjectCard = ({ subject, onClick }: { subject: any, onClick: () => void }) => {
    return (
        <div
            onClick={onClick}
            style={{ perspective: '1200px' }}
            className="group relative h-[200px] md:h-[260px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 bg-zinc-900 transform-gpu will-change-transform
                transition-all duration-500 glass-card card-3d-deep
                hover:shadow-[0_60px_120px_rgba(0,0,0,0.8),0_0_40px_rgba(220,38,38,0.2)]"
        >
            {/* Dynamic Hover Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0">
                <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_70%)] animate-pulse-slow"></div>
            </div>

            {/* Premium gradient border on hover */}
            <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 border border-white/10" />

            {/* Atmospheric glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_20%,var(--tw-gradient-from),transparent_60%)] ${subject.color.replace('bg-', 'from-')}`}></div>

            {/* Top highlight line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Watermark Icon */}
            <div className="absolute -right-6 -bottom-6 md:-right-10 md:-bottom-10 opacity-[0.03] group-hover:opacity-[0.15] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
                <SubjectIcon name={subject.icon} className={`w-40 h-40 md:w-60 md:h-60 ${subject.color.replace('bg-', 'text-')}`} />
            </div>

            <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-[2rem] flex items-center justify-center
                        shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
                        transition-all group-hover:scale-110 group-hover:rotate-[10deg] duration-500 ${subject.color}`}>
                        <SubjectIcon name={subject.icon} className="w-5 h-5 md:w-8 md:h-8 text-white drop-shadow-md" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white/60">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${subject.color}`}></div>
                        Neural Phase {subject.years[0]}
                    </div>
                    <div>
                        <h3 className="text-md md:text-3xl font-serif text-white tracking-tighter leading-none group-hover:text-red-400 transition-colors mb-2 drop-shadow-sm">
                            {subject.name}
                        </h3>
                        <p className="text-[9px] md:text-sm text-zinc-400 line-clamp-2 leading-snug font-medium">
                            {subject.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};



// Professional Compact Filter Bar Component
const FilterBar = ({ value, onChange, color = "bg-red-600" }: { value: number | 'All', onChange: (v: number | 'All') => void, color?: string }) => {
    return (
        <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1.5 overflow-hidden shrink-0 transform-gpu">
            {['All', 1, 2, 3, 4].map(y => {
                const isSelected = value === (y === "All" ? 'All' : Number(y));
                return (
                    <button
                        key={y}
                        onClick={() => onChange(y === 'All' ? 'All' : Number(y))}
                        className={`px-4 md:px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
                            isSelected 
                            ? `${color} text-white shadow-lg shadow-black/20` 
                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {y === "All" ? "Full" : `P${y}`}
                    </button>
                );
            })}
        </div>
    );
};

const CompactSubjectCard = ({ subject, onClick, subtext = "Master Resources" }: { subject: SubjectData, onClick: () => void, subtext?: string }) => {
    return (
        // CSS-only hover — runs on compositor thread, zero JS overhead
        <div
            onClick={onClick}
            className="group relative flex items-center gap-3 md:gap-6 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-900 border border-white/5 cursor-pointer overflow-hidden transform-gpu card-3d"
        >
             <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full ${subject.color} flex items-center justify-center text-white shadow-xl shrink-0 group-hover:scale-110 transition-transform`}>
                 <SubjectIcon name={subject.icon} className="w-5 h-5 md:w-8 md:h-8 text-white shadow-sm" />
             </div>

             <div className="flex-1 space-y-0.5 min-w-0">
                                   <h4 className="font-serif font-black text-white text-[8px] md:text-[10px] lg:text-[12px] uppercase tracking-tighter leading-tight break-words">{subject.name}</h4>

                 <div className="flex items-center gap-1.5">
                     <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                     <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-red-500 transition-colors truncate">{subtext}</span>
                 </div>
             </div>
             
             <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 hidden md:block">
                 <ArrowRight size={14} className="text-red-500" />
             </div>
        </div>
    );
};

// --- DYNAMIC BOOK COVER COMPONENT ---
const DynamicCover = ({ book }: { book: Book }) => {
    // Generate a consistent pseudo-random index based on book ID
    const getHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const hash = getHash(book.id);
    const gradients = [
        'from-blue-600 to-indigo-900',
        'from-emerald-500 to-teal-800',
        'from-rose-500 to-red-900',
        'from-amber-500 to-orange-800',
        'from-purple-600 to-indigo-950',
        'from-cyan-500 to-blue-800',
        'from-fuchsia-600 to-pink-900'
    ];
    const gradient = gradients[hash % gradients.length];

    // Pick icon based on keywords in title
    const getIcon = () => {
        const title = book.title.toLowerCase();
        if (title.includes('anat')) return <User size={40} />;
        if (title.includes('surg')) return <Scissors size={40} />;
        if (title.includes('phys')) return <Activity size={40} />;
        if (title.includes('pharma')) return <Pill size={40} />;
        if (title.includes('micro')) return <Microscope size={40} />;
        if (title.includes('path')) return <Activity size={40} />;
        if (title.includes('eye') || title.includes('oph')) return <Eye size={40} />;
        if (title.includes('bone') || title.includes('ortho')) return <Bone size={40} />;
        if (title.includes('baby') || title.includes('obs') || title.includes('ped')) return <Baby size={40} />;
        if (title.includes('brain') || title.includes('psych')) return <Brain size={40} />;
        return <BookOpen size={40} />;
    };

    return (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between relative group-hover:scale-105 transition-transform duration-200`}>
            {/* Subtle Overlay Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '16px 16px' }}></div>

            {/* Top Section */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white border border-white/20">
                    {book.type}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="text-white/40">
                        {getIcon()}
                    </div>
                    {book.recommendationLevel === 'gold-standard' && (
                        <div className="bg-amber-500 text-white p-1.5 rounded-lg shadow-lg shadow-amber-500/30">
                            <Star size={16} fill="white" strokeWidth={0} />
                        </div>
                    )}
                    {book.recommendationLevel === 'preferred' && (
                        <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
                            <CheckCircle size={16} fill="white" strokeWidth={0} />
                        </div>
                    )}
                    {book.recommendationLevel === 'exam-oriented' && (
                        <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg shadow-emerald-500/30">
                            <Target size={16} fill="white" strokeWidth={0} />
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Title Area */}
            <div className="relative z-10 mt-2">
                <h4 className="text-white font-black text-sm md:text-base leading-tight font-display drop-shadow-lg line-clamp-4">
                    {book.title}
                </h4>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 border-t border-white/20 pt-3">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-tight truncate">
                    {book.author}
                </p>
                <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/40 w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CINEMATIC BOOK ROLL COMPONENT ---
const BookRoll = ({ title, children }: { title?: string, children: React.ReactNode }) => {
    return (
        <UnifiedCarousel title={title}>
            {children}
        </UnifiedCarousel>
    );
};

// 4. Book Component
const BookCard = ({ book, onClick, onLongPress, onToggleFavorite, isFavorite, onSimulate }: { 
    book: Book, 
    onClick: () => void, 
    onLongPress?: () => void,
    onToggleFavorite?: (bookId: string) => void,
    isFavorite?: boolean,
    onSimulate?: () => void
}) => {
    const [imgError, setImgError] = useState(false);

    const handleContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
        if (onLongPress) {
            e.preventDefault();
            onLongPress();
        }
    };

    return (
        <div
            onClick={onClick}
            onContextMenu={handleContextMenu}
            style={{ perspective: '1000px' }}
            className={`group relative min-w-[140px] w-[140px] md:min-w-[200px] md:w-[200px] aspect-[2/3] cursor-pointer rounded-xl md:rounded-[2.5rem] overflow-hidden snap-start transition-all duration-500 glass-card card-3d ${book.parts ? 'hover:shadow-[0_50px_100px_rgba(0,0,0,0.7),0_0_30px_rgba(220,38,38,0.2)]' : 'hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]'}`}
        >
            {/* Visual Stack Effect for Multi-part Books */}
            {book.parts && (
                <>
                    <div className="absolute inset-0 bg-white/5 translate-x-1 -translate-y-1 rounded-xl md:rounded-[2.5rem] z-0 blur-[1px]" />
                    <div className="absolute inset-0 bg-black/30 translate-x-2 -translate-y-2 rounded-xl md:rounded-[2.5rem] z-[-1] blur-[2px]" />
                </>
            )}

            {/* Background Image / Cover */}
            <div className="absolute inset-0 bg-zinc-900">
                {book.coverUrl && !imgError ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 140px, 200px"
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <DynamicCover book={book} />
                )}
                {/* Mirror effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>

            {/* Recommendation Badges */}
            {book.recommendationLevel && book.recommendationLevel !== 'none' && (
                <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1.5">
                    {book.recommendationLevel === 'gold-standard' && (
                        <div className="bg-amber-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg shadow-xl shadow-amber-500/30 flex items-center gap-1.5 border border-white/20 scale-105 group-hover:scale-110 transition-transform">
                            <Star size={10} fill="white" strokeWidth={0} />
                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">GOLD</span>
                        </div>
                    )}
                    {book.recommendationLevel === 'preferred' && (
                        <div className="bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg shadow-xl shadow-blue-500/30 flex items-center gap-1.5 border border-white/20 scale-105 group-hover:scale-110 transition-transform">
                            <CheckCircle size={10} fill="white" strokeWidth={0} />
                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">PREF</span>
                        </div>
                    )}
                </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end z-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="text-white font-black text-sm md:text-xl leading-tight font-display drop-shadow-md flex-1 line-clamp-2">
                            {book.title}
                        </h4>
                        <div className="flex gap-1.5">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite?.(book.id);
                                }}
                                className={`p-1.5 md:p-2 rounded-xl transition-all ${isFavorite ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                            >
                                <Heart size={14} fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-red-400 transition-colors truncate max-w-[70%]">
                            {book.author}
                        </p>
                        {onSimulate && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSimulate();
                                }}
                                className="p-1.5 md:p-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all group/zap"
                            >
                                <Zap size={12} className="group-hover/zap:fill-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
            </div>
        </div>
    );
};

// 4. Medical Directorate (Admin Showcase)
const ADMINS = [
    {
        name: "Dr. Jay",
        role: "Lead Architect",
        email: "drastrobot@gmail.com",
        avatar: "/council/rohith.png",
        bio: "Neural architect of the Dr. Astro ecosystem. Dedicated to democratizing high-yield medical education."
    },
    {
        name: "Sathya Vengat",
        role: "Moderator",
        email: "sathyavengats2011@gmail.com",
        avatar: "/council/sathya.png",
        bio: "Curating the finest clinical resources and maintaining the integrity of the neural registry."
    },
    {
        name: "Sanjay Deivarajan",
        role: "Moderator",
        email: "deivarajan9709sanjay@gmail.com",
        avatar: "/council/sanjay.png",
        bio: "Ensuring zero-lag performance and robust data synchronization across the medical network."
    },
    {
        name: "Ramya Chockalingam",
        role: "Moderator",
        email: "ramyachockalingam777@gmail.com",
        avatar: "/council/ramya.png",
        bio: "Guiding future legends through the complexity of pre-clinical and clinical milestones."
    }
];

const MedicalDirectorate = () => {
    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
                <div>
                    <h3 className="text-slate-900 dark:text-white text-2xl md:text-5xl font-black font-serif tracking-tight uppercase">The Council</h3>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60">Neural Architects & Lead Moderators</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-red-600/5 border border-red-500/20 rounded-xl md:rounded-2xl backdrop-blur-xl">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[9px] md:text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.15em] md:tracking-[0.2em] leading-none">Council Verified Authority</span>
                </div>
            </div>
            <div className="flex overflow-x-auto gap-6 md:gap-12 pb-12 no-scrollbar snap-x snap-mandatory">
                {ADMINS.map((admin, idx) => (
                    <motion.div 
                        key={admin.email}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="group relative min-w-[280px] md:min-w-[400px] p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] transition-all duration-500 overflow-hidden flex flex-col justify-between glass-card card-3d border-white/10 h-[450px] md:h-[600px] snap-start"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-red-600/10 blur-3xl rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 group-hover:bg-red-600/20 transition-all`}></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8 md:mb-14">
                                <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] bg-zinc-800 overflow-hidden ring-4 ring-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                    <Image src={admin.avatar} alt={admin.name} width={200} height={200} className="object-cover object-[center_60%]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Validated</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 md:space-y-4 mb-8 md:mb-14">
                                <h4 className="font-serif font-black text-white text-2xl md:text-5xl uppercase tracking-tighter leading-none group-hover:text-red-400 transition-colors">{admin.name}</h4>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                                    <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-white/60">{admin.role}</p>
                                </div>
                                <p className="pt-6 md:pt-10 text-[11px] md:text-lg text-zinc-400 leading-relaxed italic line-clamp-4 font-medium opacity-80">
                                    &quot;{admin.bio}&quot;
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 md:pt-14 border-t border-white/5 flex items-center justify-between">
                            <div className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none">{admin.email.split('@')[0]}</div>
                            <button className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all group/btn shadow-xl">
                                <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ── HIGH YIELD PEARLS REGISTRY ──────────────────────────────────────────
const HIGH_YIELD_PEARLS = [
    { title: "Virchow's Triad", content: "Endothelial injury, Stasis, Hypercoagulability - The core of Venous Thromboembolism.", category: "Pathology" },
    { title: "Cushing's Triad", content: "Bradycardia, Hypertension, Irregular respirations - Sign of increased ICP.", category: "Neurology" },
    { title: "Beck's Triad", content: "Hypotension, JVP elevation, Muffled heart sounds - Cardiac Tamponade.", category: "Cardiology" },
    { title: "Whipple's Triad", content: "Hypoglycemic symptoms, Low plasma glucose, Relief with glucose - Insulinoma.", category: "Endocrinology" },
    { title: "Charcot's Triad", content: "Fever, Jaundice, RUQ pain - Ascending Cholangitis.", category: "Surgery" },
    { title: "Pellagra 4 D's", content: "Dermatitis, Diarrhea, Dementia, Death - Vitamin B3 (Niacin) deficiency.", category: "Nutrition" },
    { title: "Multiple Myeloma CRAB", content: "Calcium (high), Renal failure, Anemia, Bone lesions.", category: "Hematology" }
];

// ── ASTRO-PULSE SIDEBAR COMPONENT ──────────────────────────────────────
const AstroPulseSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 z-[200] w-[320px] md:w-[400px] bg-zinc-950/80 backdrop-blur-3xl border-r border-white/10 p-8 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                                    <Zap size={20} className="fill-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Astro Pulse</h3>
                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Neural Quick-Access</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar pr-2">
                            {/* Neural Scan Action */}
                            <button 
                                onClick={() => {
                                    alert("Initiating Global Neural Scan...");
                                }}
                                className="w-full p-6 bg-gradient-to-br from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/30 rounded-[2rem] flex items-center justify-between group/scan transition-all shadow-xl mb-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover/scan:scale-110 transition-transform">
                                        <Activity size={24} className="animate-pulse" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Neural Scan</div>
                                        <div className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest mt-0.5">Detect Weak Links</div>
                                    </div>
                                </div>
                                <ArrowRight size={20} className="text-red-500 group-hover/scan:translate-x-1 transition-transform" />
                            </button>

                            {/* High Yield Pearls Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">High-Yield Pearls</h4>
                                    <div className="w-8 h-px bg-white/10" />
                                </div>
                                <div className="space-y-4">
                                    {HIGH_YIELD_PEARLS.map((pearl, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-red-600/30 transition-all group">
                                            <div className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-2">{pearl.category}</div>
                                            <h5 className="text-white font-bold text-sm mb-2 group-hover:text-red-400 transition-colors">{pearl.title}</h5>
                                            <p className="text-zinc-400 text-xs leading-relaxed">{pearl.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clinical Shortcuts */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Neural Shortcuts</h4>
                                    <div className="w-8 h-px bg-white/10" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Case Proforma', 'VIVA Stations', 'OSCE Map', 'ECG Master'].map((label, i) => (
                                        <button key={i} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-all shadow-inner">
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-red-600/5 border border-red-500/20 rounded-2xl">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <div className="flex-1">
                                    <div className="text-[9px] font-black text-white uppercase tracking-widest">DNA Cloud Permanent Link</div>
                                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter mt-0.5">Persistence Integrity 100%</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-white/5 rounded-2xl">
                                <Lock size={12} className="text-zinc-500" />
                                <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Lockdown Protocol Active</div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// 7. Home View (Restored Hero)
// ── NEURAL ORACLE (AI ASSISTANT) ────────────────────────────────────────
const NeuralOracle = ({ onClose }: { onClose: () => void }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Neural Voice Protocol not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
        };
        recognition.start();
    };

    const askOracle = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            // Mock AI response for medical queries
            await new Promise(r => setTimeout(r, 1500));
            setResponse(`Neural Analysis Complete: Regarding "${query}", clinical guidelines suggest a structured approach focusing on diagnostic precision and evidence-based management. For deep-dive, refer to the high-yield manuals in your Foundations Hub.`);
        } catch {
            setResponse("Neural Link Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-32 right-6 md:right-12 z-[150] w-[calc(100vw-3rem)] md:w-96 bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-red-600/10"
        >
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                            <Sparkles size={16} />
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Neural Oracle</h4>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="bg-black/40 rounded-2xl p-4 min-h-[100px] flex flex-col justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Consulting Archives...</p>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">
                            {response || "I am the Neural Oracle. Ask me any clinical question or concept for a precision summary."}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askOracle()}
                        placeholder="Ask about a concept..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder:text-zinc-700 outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                    <div className="absolute right-2 top-1.5 flex gap-1">
                        <button 
                            onClick={startListening}
                            className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                        >
                            <Mic size={14} />
                        </button>
                        <button 
                            onClick={askOracle}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                        >
                            <Zap size={14} className="fill-white" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const HomeView = ({ setView, onBookClick, subjects, currentUser, onManageBook, onToggleFavorite, onSimulate }: {
    setView: (v: ViewState) => void,
    onBookClick: (b: Book) => void,
    subjects: Record<string, SubjectData>,
    currentUser: AppUser | null,
    onManageBook?: (mode: 'add' | 'edit', subjectId: string, sectionId: string, book?: Book) => void,
    onToggleFavorite: (bookId: string) => void,
    onSimulate: (b: Book) => void
}) => {
    const { recentIds } = useRecentlyViewed();
    const { streak, minutes } = useStudyTime();
    const [showOracle, setShowOracle] = useState(false);
    const [showPulseSidebar, setShowPulseSidebar] = useState(false);


    // Reconstruct recent books with location info for management tools - MEMOIZED for performance
    const recentBooksWithLoc = useMemo(() => {
        const result: { book: Book, sId: string, secId: string }[] = [];
        recentIds.forEach(id => {
            let match: { book: Book, sId: string, secId: string } | undefined;
            for (const [sId, s] of Object.entries(subjects)) {
                for (const [secId, list] of Object.entries(s.materials)) {
                    const found = (list as Book[]).find((b: Book) => b.id === id);
                    if (found) { match = { book: found, sId, secId }; break; }
                }
                if (match) break;
            }
            if (match) result.push(match);
        });
        return result;
    }, [recentIds, subjects]);

    const user = currentUser;
    
    const formatName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1 && /^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Doc\.?)$/i.test(parts[0])) {
            return parts[1];
        }
        return parts[0];
    };
    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        return 'Evening';
    };

    return (
        <div className="animate-view-transition bg-zinc-950 min-h-screen relative overflow-x-hidden selection:bg-red-600/30">
            {/* Cinematic Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.08),transparent_70%)]" />
                <div className="absolute inset-0 grid-overlay opacity-30" />
                {/* Pulsing Neural Nodes */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/[0.03] blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/[0.03] blur-[150px] rounded-full animate-pulse-slow delay-1000" />
            </div>

            {/* ── CINEMATIC HERO ── */}
            <div className="relative min-h-screen w-full flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden px-4">
                <div className="absolute inset-0 z-0">
                    {/* Hero image: only translate animates → GPU composited */}
                    <Image
                        src="/hero-bg.png"
                        alt="Neural Environment"
                        fill
                        className="object-cover opacity-25 scale-110 animate-scale-slow gpu"
                        priority
                    />
                    {/* Static depth gradients — no animation cost */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-zinc-950/80 to-zinc-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(220,38,38,0.14),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.07),transparent_55%)]" />
                    {/* Ambient orbs — only translateY animates → cheap */}
                    <div className="absolute top-1/4 left-[15%] w-80 h-80 rounded-full bg-red-600/[0.06] blur-[90px] animate-float gpu pointer-events-none" />
                    <div className="absolute bottom-1/3 right-[15%] w-64 h-64 rounded-full bg-blue-600/[0.05] blur-[70px] animate-float-delayed gpu pointer-events-none" />
                </div>

                <div className="relative z-10 max-w-6xl w-full text-center space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-10"
                    >
                        <div className="flex flex-col items-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="inline-flex items-center gap-4 px-8 py-3.5 bg-black/60 border border-white/10 rounded-full backdrop-blur-3xl mb-20"
                                style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" style={{ boxShadow: '0 0 8px rgba(220,38,38,0.8)' }}></span>
                                </span>
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.6em] opacity-80">{getTimeOfDay()} Protocol Active</span>
                            </motion.div>
                            
                            <h2 className="flex flex-col items-center text-center space-y-4 mb-20">
                                <span className="text-2xl md:text-[3.5vw] font-serif italic text-white/30 tracking-tight leading-none">Welcome back,</span>
                                {/* 3D shimmer gradient name */}
                                <span
                                    className="text-7xl md:text-[10vw] font-display font-black not-italic pb-2 block text-transparent bg-clip-text"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #f97316 35%, #dc2626 65%, #ef4444 100%)',
                                        backgroundSize: '200% auto',
                                        animation: 'shimmer 5s linear infinite',
                                        filter: 'drop-shadow(0 0 30px rgba(220,38,38,0.4))'
                                    }}
                                >
                                    {formatName(user?.name || 'Astro')}
                                </span>
                            </h2>
                            
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="h-px w-48 bg-gradient-to-r from-transparent via-red-600/50 to-transparent mx-auto" style={{ boxShadow: '0 0 10px rgba(220,38,38,0.3)' }}></div>
                                <p className="text-lg md:text-3xl text-zinc-400 font-medium leading-tight text-balance opacity-90 tracking-tight">
                                    Empowering the <span className="text-white font-serif italic">Art of Healing</span> <br className="hidden md:block" /> 
                                    through the <span className="text-white font-black uppercase tracking-widest text-xs md:text-base">Science of Neural Excellence.</span>
                                </p>
                                <div className="h-px w-48 bg-gradient-to-r from-transparent via-red-600/50 to-transparent mx-auto" style={{ boxShadow: '0 0 10px rgba(220,38,38,0.3)' }}></div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-16 md:pt-24">
                            {/* 3D Primary CTA */}
                            <button 
                                onClick={() => setView('THEORY')}
                                className="btn-3d relative px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-red-600 hover:text-white transition-colors duration-300 overflow-hidden group"
                            >
                                <span className="relative z-10">Enter Foundations</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                            </button>
                            {/* 3D Ghost CTA */}
                            <button 
                                onClick={() => setView('EXAM_PREP')}
                                className="btn-3d relative px-10 py-5 bg-white/5 border border-white/15 text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 overflow-hidden group"
                            >
                                Master Hub
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Indicators */}
                <div className="absolute bottom-12 left-12 hidden lg:flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 animate-bounce">
                        <ArrowRight className="rotate-90" size={20} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Scroll to Explore Neural Matrix</div>
                </div>
            </div>

            {/* ── NEURAL STATUS DASHBOARD ── */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 mb-20 md:mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* EXP Card */}
                    <div className="lg:col-span-2 glass-card card-3d rounded-[2.5rem] p-8 relative overflow-hidden group border-white/10">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sparkles size={80} className="text-red-600" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-1">Neural Integration</h3>
                                    <p className="text-2xl font-display font-black text-white tracking-tighter">Level {Math.floor((currentUser?.totalXP || 0) / 1000) + 1} <span className="text-zinc-500 font-serif italic text-lg ml-2">{
                                        (currentUser?.totalXP || 0) < 1000 ? 'Medical Intern' :
                                        (currentUser?.totalXP || 0) < 3000 ? 'Resident Physician' :
                                        (currentUser?.totalXP || 0) < 7000 ? 'Senior Registrar' : 'Consultant Surgeon'
                                    }</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Knowledge</p>
                                    <p className="text-xl font-black text-white">{currentUser?.totalXP || 0} XP</p>
                                </div>
                            </div>
                            
                            {/* The EXP Bar */}
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentUser?.totalXP || 0) % 1000) / 10}%` }}
                                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">
                                    <span>{((currentUser?.totalXP || 0) % 1000)} / 1000 XP to Next Evolution</span>
                                    <span className="text-red-500 animate-pulse">Syncing...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streak Card */}
                    <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[2.5rem] p-8 shadow-2xl shadow-red-600/20 relative overflow-hidden group card-3d border border-white/10">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Zap size={60} className="fill-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-1">Daily Pulse</h3>
                                <p className="text-5xl font-black text-white tracking-tighter">{streak} Days</p>
                            </div>
                            <div className="pt-4">
                                <div className="flex gap-1.5">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (streak % 7 || 7) ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-black/20'}`} />
                                    ))}
                                </div>
                                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-3">Neural Consistency: {streak > 7 ? 'High Frequency' : 'Stabilizing'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CINEMATIC CAROUSELS (HIGH VISIBILITY) --- */}
            <div className="relative z-10 max-w-7xl mx-auto mb-16">
                {CINEMATIC_COLLECTIONS.map((collection, idx) => (
                    <CarouselSection 
                        key={idx} 
                        title={collection.title} 
                        items={collection.items} 
                    />
                ))}
            </div>

            {/* BENTO GRID: NEURAL COMMAND CENTER */}
            <div className="w-full px-4 md:px-8 space-y-24 md:space-y-40 pb-40">
                
                {/* SECTION 1: NEURAL HISTORY (WIDE TOP) */}
                <section className="flex flex-col md:flex-row gap-8 mb-20">
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-red-500/50 rotate-90 my-8 whitespace-nowrap uppercase tracking-[0.5em]">
                                ACCESS_LOG
                            </span>
                            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-8">Recent <span className="text-red-600">Access</span></h3>
                    
                    {recentBooksWithLoc.length > 0 ? (
                        <UnifiedCarousel>
                            {recentBooksWithLoc.map(({ book, sId, secId }, idx) => (
                                <div key={`${book.id}-${idx}`} className="snap-start">
                                    <BookCard 
                                        book={book} 
                                        onClick={() => onBookClick(book)}
                                        onToggleFavorite={onToggleFavorite}
                                        isFavorite={currentUser?.favorites?.includes(book.id)}
                                        onSimulate={() => onSimulate(book)}
                                        onLongPress={currentUser?.role === 'admin' ? () => onManageBook?.('edit', sId, secId, book) : undefined}
                                    />
                                </div>
                            ))}
                        </UnifiedCarousel>
                    ) : (
                        <div className="p-20 rounded-[3rem] border border-dashed border-white/10 bg-white/5 text-center flex flex-col items-center gap-4">
                            <Clock className="text-white/20" size={48} />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">No recent neural transfers</p>
                        </div>
                    )}
                    </div>
                </section>

                {/* SECTION 2: BENTO GRID (INTELLIGENCE & CLINICAL) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* LEFT LARGE: NEURAL LABORATORY PORTAL */}
                    <div className="md:col-span-8 group relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden glass-card border-white/10 shadow-3xl p-10 md:p-16 h-full flex flex-col justify-between min-h-[500px] cursor-pointer active:scale-[0.99] transition-all"
                         onClick={() => setView('NEURAL_LAB')}>
                        
                        {/* Cinematic Background */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
                            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full group-hover:bg-red-600/20 transition-all duration-1000" />
                        </div>

                        <div className="relative z-10 space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] border border-white/20 group-hover:rotate-[360deg] transition-all duration-1000">
                                    <Cpu size={40} />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mb-2 animate-pulse">Neural Protocol Alpha</h3>
                                    <h4 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Neural <span className="text-red-600">Laboratory</span></h4>
                                </div>
                            </div>

                            <p className="text-xl md:text-3xl text-zinc-400 font-serif italic max-w-2xl leading-relaxed">
                                Access the centralized <span className="text-white">Clinical Command Center</span>. Sync your medical readiness across all disciplines and engage in high-fidelity diagnostic simulations.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Activity size={16} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Diagnostic Uplink Active</span>
                                </div>
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Database size={16} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">19 Subject Registries Synced</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between pt-12 border-t border-white/10">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol Version: 4.8.0_NEURAL</div>
                            <div className="flex items-center gap-3 text-white group-hover:text-red-500 transition-colors">
                                <span className="text-xs font-black uppercase tracking-widest">Initialize Terminal</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>

                        {/* Scanning Bar */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 overflow-hidden">
                            <div className="h-full bg-red-600 animate-scan" />
                        </div>
                    </div>

                    {/* RIGHT STACK: STATS 3D ENHANCED */}
                    <div className="md:col-span-4 space-y-6">
                        {/* STUDY TIME - 3D CARD */}
                        <div className="relative group card-3d bg-zinc-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-4 overflow-hidden cursor-default">
                            {/* Glow bg on hover */}
                            <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            {/* Shine highlight */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <Clock size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-[9px] font-black text-red-500 group-hover:text-white/70 uppercase tracking-widest transition-colors">Neural Load</div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-4xl md:text-5xl font-black text-white group-hover:scale-105 transition-transform origin-left">{minutes}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 group-hover:text-white/60 uppercase tracking-widest transition-colors mt-1">Minutes Study Phase</div>
                                </div>
                            </div>
                        </div>

                        {/* STREAK - 3D GLOW CARD */}
                        <div className="relative group card-3d bg-gradient-to-br from-indigo-950/80 to-zinc-950 border border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-4 overflow-hidden cursor-default">
                            <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-25 transition-opacity">
                                <Zap size={80} className="fill-indigo-400" />
                            </div>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Trophy size={20} className="text-indigo-400" />
                                    </div>
                                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Streak</div>
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-white">{streak}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Mastery Horizon</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Study Shelf (Favorites) */}
                {currentUser?.favorites && currentUser.favorites.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">My Study Shelf</h2>
                                    <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase">Private Board • {currentUser.favorites.length} Books Pinned</p>
                                </div>
                            </div>
                        </div>
                        
                        <UnifiedCarousel>
                            {currentUser.favorites.map(favId => {
                                // Find book in any subject
                                let foundBook = null;
                                Object.values(subjects).forEach(sub => {
                                    Object.values(sub.materials).forEach((list: any) => {
                                        const b = list.find((b: any) => b.id === favId);
                                        if (b) foundBook = b;
                                    });
                                });
                                
                                if (!foundBook) return null;
                                return (
                                    <div key={favId} className="snap-start">
                                        <BookCard 
                                            book={foundBook} 
                                            onClick={() => onBookClick(foundBook!)}
                                            onToggleFavorite={() => onToggleFavorite(favId)}
                                            isFavorite={true}
                                            onSimulate={() => onSimulate(foundBook!)}
                                        />
                                    </div>
                                );
                            })}
                        </UnifiedCarousel>
                    </div>
                )}

                {/* Recently Viewed */}
                {Object.values(subjects).length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-600">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Continuing Phase</h2>
                                    <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase">Intelligence Hub • Persistent Memory</p>
                                </div>
                            </div>
                        </div>

                        <UnifiedCarousel>
                            {Object.values(subjects)[0].materials.textbooks.slice(0, 5).map(book => (
                                <div key={book.id} className="snap-start">
                                    <BookCard 
                                        book={book} 
                                        onClick={() => onBookClick(book)}
                                        isFavorite={currentUser?.favorites?.includes(book.id)}
                                        onToggleFavorite={onToggleFavorite}
                                        onSimulate={() => onSimulate(book)}
                                    />
                                </div>
                            ))}
                        </UnifiedCarousel>
                    </div>
                )}

                <MedicalDirectorate />

                <AnimatePresence>
                    {showOracle && <NeuralOracle onClose={() => setShowOracle(false)} />}
                </AnimatePresence>

                <AstroPulseSidebar isOpen={showPulseSidebar} onClose={() => setShowPulseSidebar(false)} />

                {/* --- FLOATING TRIGGERS (L/R) --- */}
                {/* Right: Oracle */}
                <button 
                    onClick={() => setShowOracle(!showOracle)}
                    className="fixed bottom-10 right-6 md:right-12 z-[140] w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all group"
                >
                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 group-hover:hidden" />
                    <Sparkles size={28} />
                </button>

                {/* Left: Pulse Sidebar */}
                <button 
                    onClick={() => setShowPulseSidebar(true)}
                    className="fixed top-1/2 left-0 -translate-y-1/2 z-[180] w-10 h-24 bg-zinc-900 border border-l-0 border-white/10 rounded-r-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-red-500 hover:w-12 hover:bg-zinc-800 transition-all group"
                >
                    <Zap size={18} className="animate-pulse" />
                    <div className="mt-4 [writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-[0.2em]">Pulse</div>
                </button>
            </div>
        </div>
    );
};

const TheoryView = ({ onSelectSubject, subjects, currentUser }: {
    onSelectSubject: (id: string) => void,
    subjects: Record<string, SubjectData>,
    currentUser: AppUser | null
}) => {
    // Default to user's year if available, otherwise 'All'
    const [filterYear, setFilterYear] = useState<number | 'All'>(() => {
        if (currentUser?.yearOfStudy) {
            const year = parseInt(currentUser.yearOfStudy);
            return !isNaN(year) ? year : 'All';
        }
        return 'All';
    });

    const filteredSubjects = Object.values(subjects).filter(s =>
        filterYear === 'All' ? true : s.years.includes(filterYear as number)
    );

    return (
        <div className="animate-view-transition pt-4 md:pt-14 pb-20 overflow-x-hidden transform-gpu will-change-[opacity,transform,filter]">
            <div className="relative group/header bg-zinc-900 border border-white/5 rounded-[2rem] md:rounded-[4rem] p-6 md:p-14 mb-8 md:mb-12 overflow-hidden shadow-2xl transform-gpu">
                {/* Background Atmosphere - Optimized */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] from-red-600"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))] shadow-inner"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 text-center md:text-left">
                    <div className="w-16 h-16 md:w-36 md:h-36 rounded-[1.5rem] md:rounded-[3.5rem] bg-red-600 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0">
                        <BookOpen size={48} className="text-white w-8 h-8 md:w-20 md:h-20" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Academic Library
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-tight md:leading-none">Foundation Hub</h1>
                    </div>
                </div>
            </div>

            {/* Compact Professional Filter Console */}
            <div className="sticky top-2 md:top-24 z-30 w-full mb-8 md:mb-16">
                <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1.5 md:gap-3 max-w-2xl mx-auto overflow-hidden">
                    <div className="flex items-center gap-3 px-4 border-r border-white/10 shrink-0">
                        <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                        <h2 className="text-[10px] font-black text-white uppercase tracking-tighter">Registry</h2>
                    </div>
                    {/* Filter Pills */}
                    <FilterBar value={filterYear} onChange={setFilterYear} color="bg-red-600" />
                </div>
            </div>

            {/* Subject Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredSubjects.map(subject => (
                    <SubjectCard key={subject.id} subject={subject} onClick={() => onSelectSubject(subject.id)} />
                ))}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-zinc-400" size={32} />
                    </div>
                    <p className="text-zinc-500 font-medium">No subjects found for this selection.</p>
                </div>
            )}
        </div>
    );
};

const SubjectDetailView = ({ 
    subjectId, 
    subjects, 
    currentUser, 
    onBack, 
    onBookClick, 
    onManageBook, 
    onMoveBook,
    onDuplicateBook, 
    onReorderBooks,
    onToggleFavorite, 
    onSimulate,
    onAddSection,
    onRemoveSection,
    setSectionEditConfig,
    navigate
}: any) => {
    const subject = subjects[subjectId];
    if (!subject) return <div>Subject not found</div>;

    const categories = (subject as any).categories || [
        { key: 'textbooks', label: 'Standard Textbooks' },
        { key: 'reference', label: 'Reference Books' }
    ];

    return (
        <div className="animate-view-transition px-4 md:px-12 pb-32">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-10">
                <button onClick={onBack} className="group inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-colors bg-white/5 border border-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={14} /> Back to Foundation
                </button>
            </div>

            {/* Subject Hero Section */}
            <div className="relative group/header glass-card card-3d border-white/10 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 mb-12 md:mb-24 overflow-hidden shadow-2xl transform-gpu">
                <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] ${subject.color.replace('bg-', 'from-')}`}></div>
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover/header:opacity-100 transition-opacity">
                    <div className="w-full h-1 bg-white/30 shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-scan" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 text-center md:text-left">
                    <div className={`w-20 h-20 md:w-36 md:h-36 rounded-[2rem] md:rounded-[3.5rem] ${subject.color} flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 group-hover:scale-110 transition-transform duration-700`}>
                        <SubjectIcon name={subject.icon} className="w-10 h-10 md:w-20 md:h-20 text-white" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Verified Archive</span>
                            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                            <span className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Medical Registry Active</span>
                        </div>
                        <h1 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-tight md:leading-none">{subject.name}</h1>
                        <p className="text-xs md:text-xl text-zinc-400 max-w-3xl leading-relaxed font-medium italic opacity-80">{subject.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {categories.map((cat: any, idx: number) => {
                    const materials = subject.materials as unknown as Record<string, Book[]>;
                    const books: Book[] = materials[cat.key] || [];
                    const isEmpty = books.length === 0;

                    if (isEmpty) return null;

                    return (
                        <div key={cat.key} className="group/section relative mb-24">
                            <div className="space-y-6">
                                <div id={cat.key} className="relative pl-6 border-l-4 border-red-600">
                                    <h3 
                                        className={`text-3xl md:text-5xl font-black text-white tracking-tighter uppercase transition-all duration-300 ${currentUser?.role === 'admin' ? 'hover:text-red-500 cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (currentUser?.role === 'admin') {
                                                setSectionEditConfig({
                                                    isOpen: true,
                                                    mode: 'edit',
                                                    type: 'general',
                                                    subjectId,
                                                    section: cat
                                                });
                                            }
                                        }}
                                    >
                                        {cat.label}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                                            Sequence {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="h-px w-12 bg-white/10" />
                                        <span className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-widest">
                                            {books.length} Active Records
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {currentUser?.role === 'admin' ? (
                                        <UnifiedCarousel
                                            containerComponent={Reorder.Group}
                                            containerProps={{
                                                axis: "x",
                                                values: books,
                                                onReorder: (newBooks: Book[]) => onReorderBooks(subjectId, cat.key, newBooks),
                                                className: "flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x scroll-smooth"
                                            }}
                                        >
                                            {books.map((book: Book) => (
                                                <Reorder.Item key={book.id} value={book} className="relative group/book mb-4 shrink-0">
                                                    <BookCard
                                                        book={book}
                                                        onClick={() => onBookClick(book)}
                                                        onLongPress={() => onManageBook('edit', subjectId, cat.key, book)}
                                                        onToggleFavorite={onToggleFavorite}
                                                        isFavorite={currentUser?.favorites?.includes(book.id)}
                                                        onSimulate={() => onSimulate(book)}
                                                    />
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover/book:opacity-100 scale-90 group-hover/book:scale-100 transition-all duration-300 z-30 ring-1 ring-black/5">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onManageBook('edit', subjectId, cat.key, book);
                                                            }}
                                                            className="p-2 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                            title="Edit Details"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDuplicateBook(subjectId, cat.key, book);
                                                            }}
                                                            className="p-2 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                            title="Duplicate"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </UnifiedCarousel>
                                    ) : (
                                        <BookRoll>
                                            {books.map((book: Book) => (
                                                <BookCard
                                                    key={book.id}
                                                    book={book}
                                                    onClick={() => onBookClick(book)}
                                                    onToggleFavorite={onToggleFavorite}
                                                    isFavorite={currentUser?.favorites?.includes(book.id)}
                                                    onSimulate={() => onSimulate(book)}
                                                />
                                            ))}
                                        </BookRoll>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* --- LOOKING FOR SOMETHING ELSE SECTION --- */}
                <div className="pt-8 pb-4">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-500/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4 font-display">Looking for something else?</h3>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => navigate('EXAM_SUBJECT_DETAIL', subjectId)}
                                className="text-left py-1 text-[#0066cc] dark:text-blue-400 font-bold text-sm md:text-base hover:translate-x-2 transition-transform w-fit"
                            >
                                Previous year question paper
                            </button>
                            <button
                                onClick={() => navigate('EXAM_SUBJECT_DETAIL', subjectId)}
                                className="text-left py-1 text-[#0066cc] dark:text-blue-400 font-bold text-sm md:text-base hover:translate-x-2 transition-transform w-fit"
                            >
                                Question bank
                            </button>
                            <button
                                onClick={() => navigate('PRACTICAL_SUBJECT_DETAIL', subjectId)}
                                className="text-left py-1 text-[#0066cc] dark:text-blue-400 font-bold text-sm md:text-base hover:translate-x-2 transition-transform w-fit"
                            >
                                Practical Materials
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExamSubjectDetailView = ({
    subjectId,
    subjects,
    currentUser,
    onBack,
    onBookClick,
    onManageBook,
    onMoveBook,
    onDuplicateBook,
    onReorderBooks,
    onToggleFavorite,
    onSimulate,
    onRemoveSection,
    setSectionEditConfig
}: any) => {
    const subject = subjects[subjectId];
    if (!subject) return <div>Subject not found</div>;

    const categories = subject.examSections || [
        { id: 'pyqs', label: 'Previous Year Questions' },
        { id: 'notes', label: 'High-Yield Notes' }
    ];

    return (
        <div className="animate-view-transition px-4 md:px-12 pb-4">
            <button onClick={onBack} className="group inline-flex items-center gap-3 text-zinc-500 hover:text-white mb-10 transition-colors bg-white/5 border border-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={14} /> Back to Hub
            </button>

            <div className="relative group/header glass-card card-3d border-white/10 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 mb-12 md:mb-16 overflow-hidden shadow-2xl transform-gpu">
                <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] ${subject.color.replace('bg-', 'from-')}`}></div>
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover/header:opacity-100 transition-opacity">
                    <div className="w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-scan" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 text-center md:text-left">
                    <div className={`w-20 h-20 md:w-36 md:h-36 rounded-[2rem] md:rounded-[3.5rem] ${subject.color} flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 group-hover/header:scale-110 transition-transform duration-700`}>
                        <SubjectIcon name={subject.icon} className="w-10 h-10 md:w-20 md:h-20 text-white" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-red-600 text-white border border-red-400/50 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20">
                                High-Yield Protocol
                            </span>
                            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                            <span className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Advanced Analytics Online</span>
                        </div>
                        <h1 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-tight md:leading-none group-hover:text-red-500 transition-colors">Exam Hub: {subject.name}</h1>
                        <p className="text-xs md:text-xl text-zinc-400 max-w-3xl leading-relaxed font-medium italic opacity-80">Strategic clinical assessments and peer-verified mastery material.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {categories.map((cat: any) => {
                    const materials = subject.materials as unknown as Record<string, Book[]>;
                    const books: Book[] = materials[cat.id] || [];
                    const isEmpty = books.length === 0;

                    return (
                        <div key={cat.id} className="group/section relative mb-24">
                            <div className="space-y-6">
                                <div id={cat.id} className="relative pl-6 border-l-4 border-red-600">
                                    <div className="flex items-center gap-4">
                                        <h3 
                                            className="text-3xl md:text-5xl font-black text-white cursor-pointer hover:text-red-600 transition-colors uppercase tracking-tight"
                                            onClick={() => {
                                                if (currentUser?.role === 'admin') {
                                                    setSectionEditConfig({
                                                        isOpen: true,
                                                        mode: 'edit',
                                                        type: 'exam',
                                                        subjectId,
                                                        section: cat
                                                    });
                                                }
                                            }}
                                        >
                                            {cat.label}
                                        </h3>
                                        {currentUser?.role === 'admin' && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => onManageBook('add', subjectId, cat.id)}
                                                    className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                                                    title="Add Book"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete the section "${cat.label}" and ALL its contents?`)) {
                                                            onRemoveSection(subjectId, cat.id);
                                                        }
                                                    }}
                                                    className="p-2 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete Section"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {cat.description && (
                                        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 whitespace-pre-wrap max-w-4xl">
                                            {cat.description}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    {!isEmpty ? (
                                        currentUser?.role === 'admin' ? (
                                            <UnifiedCarousel
                                                containerComponent={Reorder.Group}
                                                containerProps={{
                                                    axis: "x",
                                                    values: books,
                                                    onReorder: (newBooks: Book[]) => onReorderBooks(subjectId, cat.id, newBooks),
                                                    className: "flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x scroll-smooth"
                                                }}
                                            >
                                                {books.map((book: Book, idx: number) => (
                                                    <Reorder.Item key={book.id} value={book} className="relative group/book mb-4 shrink-0">
                                                        <BookCard
                                                            book={book}
                                                            onClick={() => onBookClick(book)}
                                                            onLongPress={() => onManageBook('edit', subjectId, cat.id, book)}
                                                            onToggleFavorite={onToggleFavorite}
                                                            isFavorite={currentUser?.favorites?.includes(book.id)}
                                                            onSimulate={() => onSimulate(book)}
                                                        />
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover/book:opacity-100 scale-90 group-hover/book:scale-100 transition-all duration-300 z-30 ring-1 ring-black/5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onManageBook('edit', subjectId, cat.id, book);
                                                                }}
                                                                className="p-2 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                                title="Edit Details"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDuplicateBook(subjectId, cat.id, book);
                                                                }}
                                                                className="p-2 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                                title="Duplicate"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                                                            <button
                                                                disabled={idx === 0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMoveBook(subjectId, cat.id, book.id, 'left');
                                                                }}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all disabled:opacity-20"
                                                                title="Move Left"
                                                            >
                                                                <ArrowLeft size={14} />
                                                            </button>
                                                            <button
                                                                disabled={idx === books.length - 1}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMoveBook(subjectId, cat.id, book.id, 'right');
                                                                }}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all disabled:opacity-20"
                                                                title="Move Right"
                                                            >
                                                                <ArrowRight size={14} />
                                                            </button>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </UnifiedCarousel>
                                        ) : (
                                            <BookRoll>
                                                {books.map((book: Book) => (
                                                    <BookCard
                                                        key={book.id}
                                                        book={book}
                                                        onClick={() => onBookClick(book)}
                                                        onToggleFavorite={onToggleFavorite}
                                                        isFavorite={currentUser?.favorites?.includes(book.id)}
                                                        onSimulate={() => onSimulate(book)}
                                                    />
                                                ))}
                                            </BookRoll>
                                        )
                                    ) : (
                                        <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-white/5">
                                            <Layers className="mx-auto text-zinc-400 mb-2" size={24} />
                                            <p className="text-zinc-500 text-sm">No records initialized for this section.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {currentUser?.role === 'admin' && (
                    <button 
                        onClick={() => {
                            setSectionEditConfig({
                                isOpen: true,
                                mode: 'add',
                                type: 'exam',
                                subjectId
                            });
                        }}
                        className="w-full py-8 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs">Create New Exam Section</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const PracticalSubjectDetailView = ({
    subjectId,
    subjects,
    currentUser,
    onBack,
    navigate,
    onBookClick,
    onManageBook,
    onMoveBook,
    onDuplicateBook,
    onReorderBooks,
    onToggleFavorite,
    onSimulate,
    onRenameSection,
    onRemoveSection,
    onAddSection,
    setSectionEditConfig
}: any) => {
    const [showBlueprintModal, setShowBlueprintModal] = useState(false);
    const subject = subjects[subjectId];

    if (!subject) return <div>Subject not found</div>;

    let categories = subject.practicalSections || [
        { id: 'practicalMaterials', label: 'Practical Materials' }
    ];
    // --- REORDER LOGIC FOR ENT (User Request: Proforma below Books) ---
    if (subjectId === 'ent') {
        const entOrder = ['clinicalBooks', 'exam-cases', 'caseNotesAndViva', 'osce', 'practicalMaterials'];
        categories = [...categories].sort((a, b) => {
            const idxA = entOrder.indexOf(a.id);
            const idxB = entOrder.indexOf(b.id);
            // If unknown section, put it at the end
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
        
        // Ensure labels are synchronized with user request
        categories = categories.map((cat: any) => {
            if (cat.id === 'clinicalBooks' && cat.label !== 'Clinical Books') return { ...cat, label: 'Clinical Books' };
            if (cat.id === 'exam-cases' && cat.label !== 'Clinical Proforma') return { ...cat, label: 'Clinical Proforma' };
            return cat;
        });
    }

    return (
        <div className="animate-view-transition px-4 md:px-12 pb-32 overflow-x-hidden">
            <div className="relative group/header glass-card card-3d border-white/10 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 mb-12 md:mb-16 overflow-hidden shadow-2xl transform-gpu">
                {/* Background Atmosphere - Optimized */}
                <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] ${subject.color.replace('bg-', 'from-')}`}></div>
                
                {/* Neural Scan Bar */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover/header:opacity-100 transition-opacity">
                    <div className="w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-scan" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 text-center md:text-left">
                    <div className={`w-20 h-20 md:w-36 md:h-36 rounded-[2rem] md:rounded-[3.5rem] ${subject.color} flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 group-hover/header:scale-110 transition-transform duration-700`}>
                        <SubjectIcon name={subject.icon} className="w-10 h-10 md:w-20 md:h-20 text-white" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Practical Vault
                            </span>
                            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                            <span className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Clinical Simulation Ready</span>
                        </div>
                        <h1 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-tight md:leading-none group-hover:text-red-500 transition-colors">Practical: {subject.name}</h1>
                        <p className="text-xs md:text-xl text-zinc-400 max-w-3xl leading-relaxed font-medium italic opacity-80">Interactive clinical cases, OSCE maps, and high-fidelity VIVA simulations.</p>
                    </div>
                </div>
            </div>

            {/* --- ASSESSMENT BLUEPRINT SECTION (Context Aware) --- */}
            {subjectId === 'general-medicine' && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="bg-blue-600/5 border border-blue-500/10 rounded-[3rem] p-8 md:p-14 overflow-hidden relative group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ClipboardList size={180} className="text-blue-500" />
                        </div>
                        
                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Award size={14} /> Official University Pattern
                                </div>
                                
                                <div className="space-y-3">
                                    <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-none">Practical Pattern</h2>
                                    <p className="text-zinc-400 text-sm md:text-lg leading-relaxed max-w-md font-medium">
                                        Total Weightage: <span className="text-white font-black">200 Marks</span>. Comprehensive distribution for General Medicine.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="text-blue-500 font-black text-3xl">40</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">OSCE (2 Stations)</div>
                                        <div className="text-[9px] text-zinc-600 font-bold italic mt-1">40 Minutes Total</div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="text-blue-500 font-black text-3xl">60</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Long Case (1 Case)</div>
                                        <div className="text-[9px] text-zinc-600 font-bold italic mt-1">1 Hour Duration</div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="text-blue-500 font-black text-3xl">60</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Short Cases (2)</div>
                                        <div className="text-[9px] text-zinc-600 font-bold italic mt-1">30 Min Per Case</div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="text-blue-500 font-black text-3xl">40</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Viva Voce (4 Stations)</div>
                                        <div className="text-[9px] text-zinc-600 font-bold italic mt-1">X-rays, Instruments, ECG, Drugs</div>
                                    </div>
                                </div>
                            </div>

                            {/* The Image Container */}
                            <div className="relative group/img cursor-zoom-in" onClick={() => setShowBlueprintModal(true)}>
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
                                <Image 
                                    src="/dr_astro_medicine_pattern_high_res.png" 
                                    alt="General Medicine Assessment Scheme" 
                                    width={1200}
                                    height={800}
                                    className="relative rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-700 group-hover/img:scale-[1.03] w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl scale-0 group-hover/img:scale-100 transition-transform duration-500 delay-100">
                                        <Trophy size={32} />
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowBlueprintModal(true);
                                        }}
                                        className="text-white text-[12px] font-black uppercase tracking-[0.3em] bg-blue-600 px-8 py-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all relative overflow-hidden group/btn"
                                    >
                                        <span className="relative z-10">Expand Blueprint</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subjectId === 'ent' && (
                <div className="mb-24 flex flex-col md:flex-row gap-8">
                    {/* Monolith Accent Column */}
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-red-500/50 rotate-90 my-16 whitespace-nowrap uppercase tracking-[0.6em]">
                                CORE_PROTOCOL_00
                            </span>
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                        </div>
                    </div>

                    {/* Monolith Blueprint Block */}
                    <div className="flex-1 bg-zinc-950 border border-white/5 p-8 md:p-14 relative overflow-hidden">
                        {/* Background Texture */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(220,38,38,0.1),transparent)] opacity-50" />
                        
                        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                        <span className="text-[11px] font-mono font-black text-zinc-500 uppercase tracking-widest">System Registry Active</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                                        ENT <span className="text-red-600">Practical</span> Blueprint
                                    </h2>
                                    <p className="text-zinc-400 text-lg font-medium max-w-md border-l-2 border-white/10 pl-6 py-2">
                                        Precision assessment distribution for <span className="text-white">Oto-Rhino-Laryngology</span> final examination protocols.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'OSCE', marks: '20', sub: 'Instruments, PTA' },
                                        { label: 'Long Case', marks: '35', sub: 'CSOM / Ear' },
                                        { label: 'Short Case', marks: '25', sub: 'Septum, Tonsil' },
                                        { label: 'Viva Voce', marks: '20', sub: 'Bones, Op-Proc' }
                                    ].map((item) => (
                                        <div key={item.label} className="p-6 bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all group/stat">
                                            <div className="text-3xl font-black text-white group-hover/stat:text-red-500 transition-colors">{item.marks}</div>
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{item.label}</div>
                                            <div className="text-[9px] text-zinc-700 font-mono mt-2">{item.sub}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/img cursor-zoom-in" onClick={() => setShowBlueprintModal(true)}>
                                <div className="absolute -inset-4 bg-red-600/10 blur-3xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
                                <Image 
                                    src="/dr_astro_ent_practical_pattern_v2_high_res.png" 
                                    alt="ENT Protocol" 
                                    width={1200}
                                    height={800}
                                    className="relative border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 w-full"
                                />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-6">
                                    <button 
                                        className="text-white text-[12px] font-black uppercase tracking-[0.4em] bg-red-600 px-10 py-5 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Inspect Registry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subjectId === 'ophthalmology' && (
                <div className="mb-24 flex flex-col md:flex-row gap-8">
                    {/* Monolith Accent Column */}
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-cyan-500/50 rotate-90 my-16 whitespace-nowrap uppercase tracking-[0.6em]">
                                CORE_PROTOCOL_OPHTHAL
                            </span>
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
                        </div>
                    </div>

                    {/* Monolith Blueprint Block */}
                    <div className="flex-1 bg-zinc-950 border border-white/5 p-8 md:p-14 relative overflow-hidden group/monolith">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(6,182,212,0.1),transparent)] opacity-50" />
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    <span className="text-[11px] font-mono font-black text-cyan-500 uppercase tracking-[0.4em]">Official Protocol Distribution</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                                    Ophthalmology <span className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">Practical Pattern</span>
                                </h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-2xl border-l-2 border-cyan-500/20 pl-6 py-2">
                                    Total Marks: <span className="text-white font-black">100</span>. Detailed assessment distribution for university clinical examinations.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 relative overflow-hidden group/cases">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">1. Clinical Cases</h3>
                                            <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Total Weightage: 80 Marks</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                            <Eye size={24} />
                                        </div>
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-black text-sm uppercase tracking-wider">Part 1: Primary Case</span>
                                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-black rounded-full">40 MARKS</span>
                                            </div>
                                            <p className="text-zinc-400 text-xs leading-relaxed">Focus: Detailed history and examination of a patient with a <span className="text-white font-bold">Cataract</span>.</p>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-black text-sm uppercase tracking-wider">Part 2: Secondary Case</span>
                                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-black rounded-full">40 MARKS</span>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-zinc-400 text-xs leading-relaxed font-bold">Potential Topics:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Pseudophakia', 'Pterygium', 'Dacrocystitis', 'Corneal Ulcer', 'Aphakia'].map(t => (
                                                        <span key={t} className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded-md">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 relative overflow-hidden group/viva">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">2. Viva Voce</h3>
                                            <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Total Weightage: 20 Marks</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                            <Mic size={24} />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 px-6 py-3 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                                            <Clock size={16} className="text-cyan-500" />
                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Duration: 20 Minute Period</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { title: 'Instruments', desc: 'Surgical & Examination Tools' },
                                                { title: 'Drugs', desc: 'Essential Ocular Meds' },
                                                { title: 'Lens', desc: 'Types & Applications' },
                                                { title: 'AETCOM', desc: 'Ethics & Programmes' }
                                            ].map((v, i) => (
                                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all group/item">
                                                    <div className="text-white text-[11px] font-black uppercase tracking-wider mb-1">{v.title}</div>
                                                    <div className="text-zinc-500 text-[9px] font-medium leading-tight">{v.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subjectId === 'obg' && (
                <div className="mb-24 flex flex-col md:flex-row gap-8">
                    {/* Monolith Accent Column */}
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-purple-500/50 rotate-90 my-16 whitespace-nowrap uppercase tracking-[0.6em]">
                                CORE_PROTOCOL_OBG
                            </span>
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                        </div>
                    </div>

                    {/* Monolith Blueprint Block */}
                    <div className="flex-1 bg-zinc-950 border border-white/5 p-8 md:p-14 relative overflow-hidden group/monolith">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(147,51,234,0.1),transparent)] opacity-50" />
                        
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                                    <span className="text-[11px] font-mono font-black text-purple-500 uppercase tracking-[0.4em]">Maternal-Fetal Registry Active</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                                    OBG <span className="text-purple-500 drop-shadow-[0_0_20px_rgba(147,51,234,0.4)]">Practical Pattern</span>
                                </h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-2xl border-l-2 border-purple-500/20 pl-6 py-2">
                                    Total Marks: <span className="text-white font-black">200</span>. Comprehensive assessment for Obstetrics & Gynaecology.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Case Presentation Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">1. Cases</h4>
                                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full">100 MARKS</div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white text-[10px] font-black uppercase tracking-wider">Obstetric Case</span>
                                                <span className="text-purple-400 text-[9px] font-bold">50M</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {['GDM', 'Pre-eclampsia', 'Oligo/Poly', 'Anemia'].map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white text-[10px] font-black uppercase tracking-wider">Gynaecology Case</span>
                                                <span className="text-purple-400 text-[9px] font-bold">50M</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {['AUB', 'Infertility', 'Prolapse'].map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* OSCE Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">2. OSCE</h4>
                                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full">VAR_MARKS</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                            <div className="text-white text-[10px] font-black uppercase tracking-widest mb-2">Written OSCE</div>
                                            <div className="text-zinc-500 text-[9px]">10 – 12 Stations (Written Protocols)</div>
                                        </div>
                                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="text-purple-400 text-[10px] font-black uppercase tracking-widest">Performance</div>
                                                <div className="text-purple-400 text-[9px] font-bold">15M</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {['CuT insertion', 'Catheterization', 'BP measurement', 'Pelvic grip', 'Abdominal Exam', 'PAP smear'].map(t => (
                                                    <div key={t} className="text-[8px] text-zinc-400 flex items-center gap-1.5">
                                                        <div className="w-1 h-1 rounded-full bg-purple-500/30" />
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Counselling</span>
                                            <span className="text-purple-400 text-[9px] font-bold">5M | 1 Station</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Viva Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">3. Viva Voce</h4>
                                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full">40 MARKS</div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { t: 'Maternal Pelvis & Fetal Skull', d: '10m Station' },
                                            { t: 'AETCOM', d: '10m Station' },
                                            { t: 'Family Planning', d: '10m Station' },
                                            { t: 'Instruments + Drugs / Operative', d: '10m Station' }
                                        ].map((v, i) => (
                                            <div key={i} className="p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-purple-500/20 transition-all">
                                                <div className="text-white text-[10px] font-black uppercase tracking-wider">{v.t}</div>
                                                <div className="text-zinc-600 text-[9px] font-mono mt-1">{v.d}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setShowBlueprintModal(true)}
                                        className="w-full py-4 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                    >
                                        Inspect Registry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subjectId === 'pediatrics' && (
                <div className="mb-24 flex flex-col md:flex-row gap-8">
                    {/* Monolith Accent Column */}
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-sky-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-sky-500/50 rotate-90 my-16 whitespace-nowrap uppercase tracking-[0.6em]">
                                PEDIATRIC_REGISTRY
                            </span>
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-sky-500/30 to-transparent" />
                        </div>
                    </div>

                    {/* Monolith Blueprint Block */}
                    <div className="flex-1 bg-zinc-950 border border-white/5 p-8 md:p-14 relative overflow-hidden group/monolith">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(56,189,248,0.1),transparent)] opacity-50" />
                        
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                                    <span className="text-[11px] font-mono font-black text-sky-500 uppercase tracking-[0.4em]">Neonatal-Pediatric Uplink Active</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                                    Pediatrics <span className="text-sky-500 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">Practical Pattern</span>
                                </h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-2xl border-l-2 border-sky-500/20 pl-6 py-2">
                                    Total Marks: <span className="text-white font-black">100</span>. Core clinical tracks for Neonatology and Pediatric Medicine.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Case Presentation Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">1. Case Presentations</h4>
                                        <div className="px-3 py-1 bg-sky-500/20 text-sky-400 text-[10px] font-black rounded-full">60 MARKS</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white text-[10px] font-black uppercase tracking-wider">Neonatal Case</span>
                                                <span className="text-sky-400 text-[9px] font-bold">30M | 40m</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {['Normal Newborn', 'Neonatal Jaundice'].map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white text-[10px] font-black uppercase tracking-wider">Pediatric Case</span>
                                                <span className="text-sky-400 text-[9px] font-bold">30M | 40m</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {['CP', 'AFP', 'ADHD', 'Down Syndrome', 'Nephrotic'].map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="px-2 text-[9px] text-zinc-600 font-mono italic">Systemic: CVS, RS, GIT High-Yield cases.</div>
                                    </div>
                                </div>

                                {/* OSCE Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">2. OSCE Written</h4>
                                        <div className="px-3 py-1 bg-sky-500/20 text-sky-400 text-[10px] font-black rounded-full">20 MARKS</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                                            <div className="text-sky-400 text-[10px] font-black uppercase tracking-widest mb-2">Circuit Protocol</div>
                                            <p className="text-zinc-500 text-xs">5 Stations (2–3 mins per station)</p>
                                        </div>
                                        <div className="space-y-2 pt-4">
                                            <div className="text-white text-[10px] font-black uppercase tracking-widest opacity-40">Assessments</div>
                                            {['X-ray interpretation', 'Data interpretation', 'Instrument identification', 'Nutrition logs', 'Emergency protocols'].map((s, i) => (
                                                <div key={i} className="flex gap-3 items-center text-[10px] text-zinc-500">
                                                    <div className="w-1 h-1 rounded-full bg-sky-500/30" />
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Viva Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">3. Viva Voce</h4>
                                        <div className="px-3 py-1 bg-sky-500/20 text-sky-400 text-[10px] font-black rounded-full">20 MARKS</div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { t: 'Instruments', d: 'Identification & Clinical Use' },
                                            { t: 'Drugs & Vaccines', d: 'Immunization Schedule & Dosage' },
                                            { t: 'X-ray', d: 'Pediatric Radiographic Diagnosis' },
                                            { t: 'Nutrition / BF', d: 'Breastfeeding Counselling (BF)' }
                                        ].map((v, i) => (
                                            <div key={i} className="p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-sky-500/20 transition-all">
                                                <div className="text-white text-[10px] font-black uppercase tracking-wider">{v.t}</div>
                                                <div className="text-zinc-600 text-[9px] font-mono mt-1">{v.d}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setShowBlueprintModal(true)}
                                        className="w-full py-4 bg-sky-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                    >
                                        Inspect Registry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subjectId === 'general-surgery' && (
                <div className="mb-24 flex flex-col md:flex-row gap-8">
                    {/* Monolith Accent Column */}
                    <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                        <div className="hidden md:flex flex-col items-center gap-2">
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-rose-500/30 to-transparent" />
                            <span className="text-[10px] font-mono font-black text-rose-500/50 rotate-90 my-16 whitespace-nowrap uppercase tracking-[0.6em]">
                                CORE_PROTOCOL_SURGERY
                            </span>
                            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-rose-500/30 to-transparent" />
                        </div>
                    </div>

                    {/* Monolith Blueprint Block */}
                    <div className="flex-1 bg-zinc-950 border border-white/5 p-8 md:p-14 relative overflow-hidden group/monolith">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(225,29,72,0.1),transparent)] opacity-50" />
                        
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                                    <span className="text-[11px] font-mono font-black text-rose-500 uppercase tracking-[0.4em]">Surgical Registry Active</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                                    Surgery <span className="text-rose-500 drop-shadow-[0_0_20px_rgba(225,29,72,0.4)]">Practical Pattern</span>
                                </h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-2xl border-l-2 border-rose-500/20 pl-6 py-2">
                                    Total Marks: <span className="text-white font-black">200</span>. Comprehensive assessment distribution for General Surgery & Orthopaedics.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* OSCE Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">1. OSCE</h4>
                                        <div className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-full">60 MINS</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">Circuit Logic</div>
                                        <p className="text-zinc-500 text-xs">10 Stations + 3 Rest Stations (1.5 mins each)</p>
                                    </div>
                                    <div className="space-y-1.5 h-64 overflow-y-auto scrollbar-hide">
                                        {[
                                            'Specimen identification', 'X-ray interpretation', 'Surgical Instruments', 'Sutures', 'Operative Procedures', 
                                            'AETCOM (Counseling)', 'Clinical Case', 'General Surgery station', 'Ortho OSCE: X-ray', 'Ortho OSCE: Case'
                                        ].map((s, i) => (
                                            <div key={i} className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <span className="text-[9px] font-mono text-rose-500/50 mt-1">S{(i+1).toString().padStart(2, '0')}</span>
                                                <span className="text-[11px] text-zinc-300 font-medium">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[9px] text-rose-400 font-mono">
                                        Ortho Case: Identify → CF → Investigation → Management
                                    </div>
                                </div>

                                {/* Case Presentation Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">2. Cases</h4>
                                        <div className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-full">100 MARKS</div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                <span className="text-white text-xs font-bold uppercase tracking-wider">Long Case</span>
                                                <span className="text-rose-500 text-[10px] font-black">50M | 50m</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Ca Breast', 'Thyroid', 'Hernia', 'Hydrocele', 'PVD'].map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                <span className="text-white text-xs font-bold uppercase tracking-wider">Short Cases (2)</span>
                                                <span className="text-rose-500 text-[10px] font-black">2x25M | 25m</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Ulcer & Swelling</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['Tropic', 'Diabetic', 'Traumatic', 'Dermoid', 'Lipoma', 'Sebaceous', 'Parotid', 'Lymph node'].map(t => (
                                                        <span key={t} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Viva Voce Card */}
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-black uppercase tracking-tight">3. Viva Voce</h4>
                                        <div className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-full">40 MARKS</div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { t: 'Specimens', d: 'Pathology & Surgical Significance' },
                                            { t: 'Instruments', d: 'Parts, Indications & Usage' },
                                            { t: 'X-rays', d: 'Systemic Surgical Radiology' },
                                            { t: 'Operative', d: 'Steps & Complications' }
                                        ].map((v, i) => (
                                            <div key={i} className="group/viva hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-rose-500/20">
                                                <div className="text-white text-xs font-black uppercase tracking-wider">{v.t}</div>
                                                <div className="text-zinc-500 text-[9px] font-medium mt-1 leading-relaxed">{v.d}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setShowBlueprintModal(true)}
                                        className="w-full py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                    >
                                        Inspect Registry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-12">

                {categories.map((cat: any, idx: number) => {
                    const materials = subject.materials as unknown as Record<string, Book[]>;
                    const books: Book[] = materials[cat.id] || [];
                    const isEmpty = books.length === 0;
                    
                    const accentText = subjectId === 'ent' ? 'text-red-500' : (subjectId === 'ophthalmology' ? 'text-cyan-500' : (subjectId === 'general-surgery' ? 'text-rose-500' : (subjectId === 'pediatrics' ? 'text-sky-500' : (subjectId === 'obg' ? 'text-purple-500' : 'text-emerald-500'))));
                    const accentBg = subjectId === 'ent' ? 'bg-red-500' : (subjectId === 'ophthalmology' ? 'bg-cyan-500' : (subjectId === 'general-surgery' ? 'bg-rose-500' : (subjectId === 'pediatrics' ? 'bg-sky-500' : (subjectId === 'obg' ? 'bg-purple-500' : 'bg-emerald-500'))));

                    return (
                        <div key={cat.id} className="group/section relative mb-24">
                            <div className="space-y-6">
                                <div id={cat.id} className={`relative pl-6 border-l-4 ${accentBg}`}>
                                    <h3 
                                        className={`text-3xl md:text-5xl font-black text-white tracking-tighter uppercase transition-all duration-300 ${currentUser?.role === 'admin' ? 'hover:text-red-500 cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (currentUser?.role === 'admin') {
                                                setSectionEditConfig({
                                                    isOpen: true,
                                                    mode: 'edit',
                                                    type: 'practical',
                                                    subjectId,
                                                    section: cat
                                                });
                                            }
                                        }}
                                    >
                                        {cat.label}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                                            Sequence {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="h-px w-12 bg-white/10" />
                                        <span className={`text-[11px] font-mono font-bold ${accentText} uppercase tracking-widest`}>
                                            {books.length} Active Records
                                        </span>
                                    </div>
                                    {cat.description && (
                                        <p className="mt-4 text-sm md:text-lg text-zinc-500 font-medium leading-relaxed max-w-4xl opacity-60">
                                            {cat.description}
                                        </p>
                                    )}
                                </div>

                                {currentUser?.role === 'admin' && (
                                    <button
                                        onClick={() => onManageBook('add', subjectId, cat.id)}
                                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest transition-all"
                                    >
                                        <Plus size={14} /> Initialize New Record
                                    </button>
                                )}

                                <div className="mt-8">
                                    {!isEmpty ? (
                                        currentUser?.role === 'admin' ? (
                                            <UnifiedCarousel
                                                containerComponent={Reorder.Group}
                                                containerProps={{
                                                    axis: "x",
                                                    values: books,
                                                    onReorder: (newBooks: Book[]) => onReorderBooks(subjectId, cat.id, newBooks),
                                                    className: "flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x scroll-smooth"
                                                }}
                                            >
                                                {books.map((book: Book, idx: number) => (
                                                    <Reorder.Item key={book.id} value={book} className="relative group/book mb-4 shrink-0">
                                                        <BookCard
                                                            book={book}
                                                            onClick={() => onBookClick(book)}
                                                            onLongPress={() => onManageBook('edit', subjectId, cat.id, book)}
                                                            onToggleFavorite={onToggleFavorite}
                                                            isFavorite={currentUser?.favorites?.includes(book.id)}
                                                            onSimulate={() => onSimulate(book)}
                                                        />
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover/book:opacity-100 scale-90 group-hover/book:scale-100 transition-all duration-300 z-30 ring-1 ring-black/5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onManageBook('edit', subjectId, cat.id, book);
                                                                }}
                                                                className="p-2 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                                title="Edit Details"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDuplicateBook(subjectId, cat.id, book);
                                                                }}
                                                                className="p-2 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all"
                                                                title="Duplicate"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                                                            <button
                                                                disabled={idx === 0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMoveBook(subjectId, cat.id, book.id, 'left');
                                                                }}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all disabled:opacity-20"
                                                                title="Move Left"
                                                            >
                                                                <ArrowLeft size={14} />
                                                            </button>
                                                            <button
                                                                disabled={idx === books.length - 1}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMoveBook(subjectId, cat.id, book.id, 'right');
                                                                }}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl transition-all disabled:opacity-20"
                                                                title="Move Right"
                                                            >
                                                                <ArrowRight size={14} />
                                                            </button>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </UnifiedCarousel>
                                        ) : (
                                            <BookRoll>
                                                {books.map((book: Book) => (
                                                    <BookCard
                                                        key={book.id}
                                                        book={book}
                                                        onClick={() => onBookClick(book)}
                                                        onToggleFavorite={onToggleFavorite}
                                                        isFavorite={currentUser?.favorites?.includes(book.id)}
                                                        onSimulate={() => onSimulate(book)}
                                                    />
                                                ))}
                                            </BookRoll>
                                        )
                                    ) : (
                                        <div id="practicalMaterials-bot" className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 dark:from-emerald-900/10 dark:to-teal-900/10">
                                            <div className="space-y-2 text-center md:text-left">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    <Send size={12} className="rotate-[15deg]" /> Smart Delivery
                                                </div>
                                                <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display">Practical Content on Telegram</h4>
                                                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
                                                    Get instant access to practical videos, slide images, and dissections via our official bot.
                                                </p>
                                            </div>
                                            <a
                                                href="https://t.me/DrAstroBot"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-3 px-8 py-4 bg-[#24A1DE] hover:bg-[#2094cc] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[#24A1DE]/20 active:scale-95 whitespace-nowrap shrink-0"
                                            >
                                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                    <Send size={18} />
                                                </div>
                                                Open in Telegram
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => {
                            setSectionEditConfig({
                                isOpen: true,
                                mode: 'add',
                                type: 'practical',
                                subjectId
                            });
                        }}
                        className="w-full py-8 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-500 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-3 group/add"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/add:bg-emerald-500 group-hover/add:text-white transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Add New Practical Section</span>
                    </button>
                )}
                {/* --- BLUEPRINT EXPANSION MODAL: PREMIUM CINEMATIC VERSION --- */}
                <AnimatePresence>
                    {showBlueprintModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 backdrop-blur-[20px] bg-black/80"
                            onClick={() => setShowBlueprintModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative max-w-6xl w-full max-h-[90vh] rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(59,130,246,0.2)] border border-white/10 bg-zinc-950 flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${subjectId === 'ent' ? 'bg-red-600/20 text-red-500 border-red-500/20' : 'bg-blue-600/20 text-blue-500 border-blue-500/20'} flex items-center justify-center border`}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-3xl font-serif text-white tracking-tight">{subjectId === 'ent' ? 'ENT' : 'Medicine'} Neural Blueprint</h3>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Precision Academic Registry • V2.0</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowBlueprintModal(false)}
                                        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all group"
                                    >
                                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto p-4 md:p-12 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05),transparent_70%)] relative">
                                    {/* Scanning Bar Effect */}
                                    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                        <div className={`w-full h-1 bg-gradient-to-r from-transparent ${subjectId === 'ent' ? 'via-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'via-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]'} to-transparent opacity-20 animate-scan`} />
                                    </div>

                                    <div className="relative group/zoom">
                                        <Image 
                                            src={subjectId === 'ent' ? "/dr_astro_ent_practical_pattern_v2_high_res.png" : "/dr_astro_medicine_pattern_high_res.png"} 
                                            alt="High Resolution Blueprint"
                                            width={1600}
                                            height={1000}
                                            className="w-full h-auto rounded-3xl shadow-2xl border border-white/5 transition-transform duration-1000 group-hover:scale-[1.02]"
                                        />
                                        {/* Corner Accents */}
                                        <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${subjectId === 'ent' ? 'border-red-500' : 'border-blue-500'} rounded-tl-2xl opacity-40`} />
                                        <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${subjectId === 'ent' ? 'border-red-500' : 'border-blue-500'} rounded-tr-2xl opacity-40`} />
                                        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${subjectId === 'ent' ? 'border-red-500' : 'border-blue-500'} rounded-bl-2xl opacity-40`} />
                                        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${subjectId === 'ent' ? 'border-red-500' : 'border-blue-500'} rounded-br-2xl opacity-40`} />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        System Verified
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        High Definition Link
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ExamPrepView = ({ setView, setQuizConfig, subjects, currentUser, onSelectSubject, navigate }: {
    setView: (v: ViewState) => void,
    setQuizConfig: (config: { subjectId: string, count: number } | null) => void,
    subjects: Record<string, SubjectData>,
    currentUser: AppUser | null,
    onSelectSubject: (id: string) => void,
    navigate: (v: ViewState, id?: string) => void
}) => {
    const { history } = useQuizPerformance();
    const chartData = history.slice(-5).map((h, i) => ({ name: `Quiz ${i + 1}`, score: h.score }));
    const [filterYear, setFilterYear] = React.useState<number | 'All'>(currentUser?.yearOfStudy ? parseInt(currentUser.yearOfStudy) : 'All');

    const filteredSubjects = Object.values(subjects).filter(s =>
        filterYear === 'All' || s.years.includes(filterYear as number)
    );

    return (
        <div className="space-y-6 md:space-y-10 pt-4 md:pt-14 px-4 md:px-12 pb-32 animate-view-transition overflow-x-hidden">
            {/* Exam Hero - Neural Bento Style */}
            <div className="relative group/header bg-zinc-900 border border-white/5 rounded-[1.5rem] md:rounded-[4rem] p-5 md:p-14 mb-8 md:mb-16 overflow-hidden shadow-2xl transform-gpu">
                {/* Background Atmosphere - Optimized */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] from-yellow-600"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))] shadow-inner"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 text-center md:text-left">
                    <div className="w-20 h-20 md:w-36 md:h-36 rounded-[1.5rem] md:rounded-[3.5rem] bg-yellow-600 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0 animate-scale-slow">
                        <Trophy size={40} className="text-white md:hidden" />
                        <Trophy size={48} className="text-white hidden md:block" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/10 border border-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Intelligence Hub
                            </span>
                            <div className="h-4 md:h-6 w-px bg-white/10 hidden md:block"></div>
                            <span className="text-yellow-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Neural Verified</span>
                        </div>
                        <h1 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-none">Exam Hub</h1>
                        <p className="text-xs md:text-xl text-zinc-400 max-w-3xl leading-relaxed font-medium italic">Precision assessments and neural logs.</p>
                    </div>
                </div>
            </div>

            {/* Performance Snapshot - Swiped directly below Hero */}
            <div className="bg-white dark:bg-zinc-900 p-4 md:p-8 rounded-2xl md:rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="mb-4 md:mb-6">
                            <h3 className="text-sm md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                <TrendingUp size={16} className="text-green-500" /> Neural Performance
                            </h3>
                            <p className="text-[9px] md:text-sm text-zinc-500 font-bold uppercase tracking-tighter opacity-60">Dynamic Metrics • Last 5 Quiz Sessions</p>
                        </div>

                        <div className="h-[150px] md:h-[300px] w-full bg-zinc-50 dark:bg-zinc-800/30 rounded-xl md:rounded-2xl p-2 md:p-4 border border-zinc-100 dark:border-zinc-800/50">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 8, fontWeight: 700 }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 8 }} hide={true} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px', backgroundColor: '#18181b', color: '#fff' }}
                                    />
                                    <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={25}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#dc2626' : '#991b1b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex md:flex-col justify-around md:justify-center gap-4 md:gap-8 md:pl-8 md:border-l border-zinc-100 dark:border-zinc-800">
                        <div className="text-center md:text-left">
                            <div className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white leading-none">{history.length}</div>
                            <div className="text-[8px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Neural Logs</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl md:text-4xl font-black text-red-600 leading-none">
                                {history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}%
                            </div>
                            <div className="text-[8px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Efficiency</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Quiz Generator */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quiz Generator Card */}
                    <div className="bg-white dark:bg-zinc-900 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={120} />
                        </div>
 
                        <div className="relative z-10">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 font-display">Custom Quiz Generator</h2>
                            <p className="text-xs md:text-sm text-zinc-500 mb-6 md:mb-8">Generate a personalized quiz based on your study needs.</p>
 
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                                    <div className="relative">
                                        <select
                                            id="quiz-subject"
                                            className="w-full appearance-none p-3 md:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-sm md:text-base font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        >
                                            {Object.values(subjects).map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3 md:right-4 md:top-4 text-zinc-400 pointer-events-none">
                                            <BookOpen size={18} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Length</label>
                                    <div className="relative">
                                        <select
                                            id="quiz-count"
                                            className="w-full appearance-none p-3 md:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-sm md:text-base font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        >
                                            <option value="5">5 Questions (Quick)</option>
                                            <option value="10">10 Questions (Standard)</option>
                                            <option value="20">20 Questions (Intense)</option>
                                        </select>
                                        <div className="absolute right-3 top-3 md:right-4 md:top-4 text-zinc-400 pointer-events-none">
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <button
                                onClick={() => {
                                    const sub = (document.getElementById('quiz-subject') as HTMLSelectElement).value;
                                    const count = parseInt((document.getElementById('quiz-count') as HTMLSelectElement).value);
                                    setQuizConfig({ subjectId: sub, count });
                                    setView('QUIZ');
                                }}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/30 flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                            >
                                <Zap size={18} className="fill-white" /> Start Quiz Session
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Neural Advisory */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-red-600/5 border border-red-500/10 p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity size={20} className="text-red-500" />
                                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Neural Advisory</h4>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed italic">
                                &quot;Your performance history reveals consistent diagnostic accuracy. Continue mastering high-yield registries to finalize your board readiness.&quot;
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category 1: Exam Essentials */}
            <div className="flex flex-col md:flex-row gap-8 pt-12">
                <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                    <div className="hidden md:flex flex-col items-center gap-2">
                        <div className="w-1 h-20 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                        <span className="text-[10px] font-mono font-black text-red-500/50 rotate-90 my-12 whitespace-nowrap uppercase tracking-[0.5em]">
                            PROTOCOL_01
                        </span>
                        <div className="w-1 h-20 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                    </div>
                </div>
                <div className="flex-1 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase">Exam <span className="text-red-600">Essentials</span></h3>
                        <FilterBar value={filterYear} onChange={setFilterYear} color="bg-red-600" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                        {filteredSubjects.map(subject => (
                            <CompactSubjectCard key={subject.id} subject={subject} onClick={() => onSelectSubject(subject.id)} subtext="Neural PYQ Vault" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Category 2: Practical Vault */}
            <div className="flex flex-col md:flex-row gap-8 pt-24 border-t border-white/5">
                <div className="md:w-20 shrink-0 flex md:flex-col items-center gap-4">
                    <div className="hidden md:flex flex-col items-center gap-2">
                        <div className="w-1 h-20 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                        <span className="text-[10px] font-mono font-black text-emerald-500/50 rotate-90 my-12 whitespace-nowrap uppercase tracking-[0.5em]">
                            PROTOCOL_02
                        </span>
                        <div className="w-1 h-20 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                    </div>
                </div>
                <div className="flex-1 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">Practical <span className="text-emerald-500">Vault</span></h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Clinical Archives • Neural Lab Resources</p>
                        </div>
                        <FilterBar value={filterYear} onChange={setFilterYear} color="bg-emerald-600" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                        {filteredSubjects.map(subject => (
                            <CompactSubjectCard key={subject.id} subject={subject} onClick={() => navigate('PRACTICAL_SUBJECT_DETAIL', subject.id)} subtext="Vault Archives" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuizView = ({ subjectId, count, onComplete, onExit, showToast }: any) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [betActive, setBetActive] = useState(false); // New State for Betting
    const [points, setPoints] = useState(0); // Granular points system

    useEffect(() => {
        // Use Real NotebookLM Verified Data if available for subject, else generate
        const subset = CLINICAL_CASES.filter(c => c.subject.toLowerCase().includes(subjectId.toLowerCase()) || subjectId === 'All');
        if (subset.length < count) {
            // Fallback generation if not enough specific cases
            const generated = generateQuizFlow(subjectId, count);
            setTimeout(() => setQuestions(generated), 0);
        } else {
            // Shuffle and slice
            const shuffled = [...subset].sort(() => 0.5 - Math.random());
            const sliced = shuffled.slice(0, count).map(c => ({
                id: c.id,
                question: c.case,
                options: c.options,
                correctIndex: c.correctIndex,
                explanation: c.explanation
            } as QuizQuestion));
            setTimeout(() => setQuestions(sliced), 0);
        }
    }, [subjectId, count]);

    const handleAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIndex);
        setShowResult(true);

        const isCorrect = optionIndex === questions[currentIndex].correctIndex;
        if (isCorrect) {
            if (betActive) {
                setPoints(p => p + 20); // Double points
                showToast("Bet Won! Double Points! 🔥", "success");
            } else {
                setPoints(p => p + 10);
            }
            setScore(s => s + 1);
        } else {
            if (betActive) {
                setPoints(p => Math.max(0, p - 10)); // Lose points on failed bet
                showToast("Bet Lost! Points deducted.", "error");
            }
        }
        setBetActive(false); // Reset bet for next q
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setIsFinished(true);
            onComplete(score + (selectedOption === questions[currentIndex].correctIndex ? 1 : 0), questions.length, points);
        }
    };

    const handleBetAndNext = () => {
        // Feature: "Double Down" - User sees next question but must bet on it
        setBetActive(true);
        nextQuestion();
    };

    if (questions.length === 0) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

    if (isFinished) {
        return (
            <div className="max-w-lg mx-auto text-center pt-10 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={48} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Complete!</h2>
                <div className="text-4xl font-black text-red-600 mb-2">{points} XP</div>
                <p className="text-slate-500 mb-8">You answered {score} / {questions.length} correctly.</p>

                <button onClick={onExit} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="max-w-2xl mx-auto pt-4 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6 text-sm font-medium text-slate-500">
                <span>Question {currentIndex + 1} / {questions.length}</span>
                <span className="flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-500" />
                    <span className="text-slate-900 dark:text-white font-bold">{points} XP</span>
                </span>
            </div>

            {betActive && (
                <div className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold animate-pulse shadow-lg shadow-purple-500/30">
                    <Zap size={18} className="fill-white" /> DOUBLE POINTS ACTIVE!
                </div>
            )}

            <div className={`bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border ${betActive ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-slate-800'} mb-6 relative overflow-hidden`}>
                {betActive && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">HIGH STAKES</div>}

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                    {currentQ.question}
                </h3>
                <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                        let className = "w-full p-4 rounded-xl border-2 text-left transition-all font-medium ";
                        if (selectedOption === null) {
                            className += "border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900 hover:bg-slate-50 dark:hover:bg-slate-800";
                        } else if (idx === currentQ.correctIndex) {
                            className += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                        } else if (idx === selectedOption) {
                            className += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                        } else {
                            className += "border-slate-100 dark:border-slate-800 opacity-50";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={selectedOption !== null}
                                onClick={() => handleAnswer(idx)}
                                className={`${className} relative cursor-pointer hover:shadow-md active:scale-[0.99]`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900 mb-6 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="font-bold text-red-800 dark:text-red-300 mb-1 flex items-center gap-2">
                        <AlertCircle size={16} /> Explanation
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{currentQ.explanation}</p>
                </div>
            )}

            <div className="flex justify-end gap-3">
                {/* Only allow betting if they got the previous one right (simulate 'Hot Hand') and answer shown */}
                {(showResult && selectedOption === questions[currentIndex].correctIndex && currentIndex < questions.length - 1) && (
                    <button
                        onClick={handleBetAndNext}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 animate-bounce"
                    >
                        <Zap size={16} className="fill-white" /> Double Down?
                    </button>
                )}

                <button
                    onClick={nextQuestion}
                    disabled={!showResult}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-x-1"
                >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};

// 5. Views
const SplashScreen = ({ user, onFinish }: { user: AppUser | null, onFinish: () => void }) => {
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    });
    const [quote, setQuote] = useState(() => {
        const quotes = [
            "The good physician treats the disease; the great physician treats the patient who has the disease. — Sir William Osler",
            "Medicine is a science of uncertainty and an art of probability. — Sir William Osler",
            "Wherever the art of Medicine is loved, there is also a love of Humanity. — Hippocrates",
            "The physician should not treat the disease, but the patient who is suffering from it. — Maimonides",
            "Observation, Reason, Human Understanding, Courage; these make the physician. — Martin H. Fischer"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    });

    const quotes = [
        "The good physician treats the disease; the great physician treats the patient who has the disease. — Sir William Osler",
        "Medicine is a science of uncertainty and an art of probability. — Sir William Osler",
        "Wherever the art of Medicine is loved, there is also a love of Humanity. — Hippocrates",
        "The physician should not treat the disease, but the patient who is suffering from it. — Maimonides",
        "Observation, Reason, Human Understanding, Courage; these make the physician. — Martin H. Fischer"
    ];

    const formatName = (name: string) => {
        const parts = name.split(' ').filter(p => p.trim() !== '');
        const cleanParts = parts.filter(p => {
            const clean = p.replace(/\./g, '').toLowerCase();
            if (['dr', 'er', 'mr', 'mrs', 'ms'].includes(clean)) return false;
            if (clean.length <= 2) return false;
            return true;
        });
        return cleanParts.length > 0 ? cleanParts[0] : (parts[0] ? parts[0].replace(/\./g, '') : 'Physician');
    };

    const isFirstVisit = typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('hasVisitedSplash');

    useEffect(() => {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('hasVisitedSplash', 'true');
        }

        const timer = setTimeout(onFinish, isFirstVisit ? 5000 : 2500);
        return () => clearTimeout(timer);
    }, [onFinish, isFirstVisit]);

    return (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-out fade-out duration-700 ${isFirstVisit ? 'delay-[4300ms]' : 'delay-[1800ms]'} fill-mode-forwards pointer-events-none`}>
            
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
            >
                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse-slow" />
                <Image src="/splash-icon.png" alt="Dr. Astro" fill className="object-contain drop-shadow-2xl z-10" priority />
            </motion.div>

            <div className="flex flex-col items-center z-20 text-center px-6">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-5xl md:text-8xl font-black text-white tracking-tighter font-display drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                    DR. ASTRO
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-red-500 mt-2 tracking-[0.5em] text-xs md:text-sm uppercase font-bold drop-shadow-md"
                >
                    {greeting}, Dr. {user ? formatName(user.name) : 'Physician'}
                </motion.p>

                {isFirstVisit && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="text-zinc-400 mt-8 text-base md:text-lg max-w-md px-6 italic leading-relaxed"
                    >
                        &quot;{quote}&quot;
                    </motion.p>
                )}
            </div>

            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden"
            >
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ delay: 0.3, duration: isFirstVisit ? 4 : 1.5, ease: 'linear' }}
                    className="h-full bg-red-600 w-full"
                    style={{ boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)' }}
                />
            </motion.div>
        </div>
    );
};

// 6. Login View (Updated)
const LoginView = ({ onLogin }: { onLogin: (u: AppUser) => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [onboardingUser, setOnboardingUser] = useState<Partial<AppUser>>({});
    const [lastUser, setLastUser] = useState<AppUser | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(AuthService.SESSION_KEY);
        if (stored) setLastUser(JSON.parse(stored));

        // Check for Password Reset Code in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('oobCode');
        const mode = params.get('mode');
        if (code && mode === 'resetPassword') {
            setResetCode(code);
            setIsResetting(true);
            setIsLogin(false);
        }
    }, []);

    const [formData, setFormData] = useState({
        email: '', password: '', name: '', phone: '', college: '', batchYear: '', gender: 'male' as 'male' | 'female', yearOfStudy: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setError('');

        try {
            if (isResetting) {
                if (!formData.password || formData.password.length < 6) {
                    setError('Digital safety requires at least 6 characters.');
                    setIsLoading(false);
                    return;
                }
                await confirmPasswordReset(auth, resetCode, formData.password);
                setSuccessMsg('Neural link restored. Password updated successfully.');
                setIsResetting(false);
                setIsLogin(true);
                // Clear URL params
                window.history.replaceState({}, '', window.location.pathname);
                setIsLoading(false);
                return;
            }

            if (isForgot) {
                const cleanEmail = (formData.email || '').trim();
                if (!cleanEmail) {
                    setError('Please provide your registered email address.');
                    setIsLoading(false);
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(cleanEmail)) {
                    setError('The email address format is invalid.');
                    setIsLoading(false);
                    return;
                }
                await sendPasswordResetEmail(auth, cleanEmail);
                setSuccessMsg('Security protocol initiated. Check your inbox for the recovery link.');
                setIsForgot(false);
                setIsLoading(false);
                return;
            }

            if (isLogin) {
                const user = await AuthService.login(formData.email, formData.password);
                if (user) {
                    setSuccessMsg(`Welcome back, ${user.name}`);
                    // Log Login Activity
                    ActivityService.log(user, 'login', user.id, 'Self');

                    // Remove artificial delay
                    onLogin(user);
                } else {
                    setError('Access Denied. Neural credentials invalid.');
                }
            } else {
                const newUser: AppUser = {
                    id: Math.random().toString(36).substring(2, 11),
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: ADMIN_EMAILS.includes(formData.email.toLowerCase()) ? 'admin' : 'user',
                    status: 'active',
                    joinedAt: new Date().toISOString(),
                    phone: formData.phone,
                    college: formData.college,
                    batchYear: formData.batchYear,
                    gender: formData.gender,
                    yearOfStudy: formData.yearOfStudy,
                };
                await AuthService.addUser(newUser);
                const loggedIn = await AuthService.login(newUser.email, newUser.password!);
                if (loggedIn) {
                    setSuccessMsg(`Welcome to the team, Dr. ${loggedIn.name}`);
                    ActivityService.log(loggedIn, 'login', loggedIn.id, 'Self (New Account)');

                    // Remove artificial delay
                    onLogin(loggedIn);
                }
            }
        } catch (err: any) {
            let msg = err.message || 'An error occurred';
            if (err.code === 'auth/invalid-email' || err.message.includes('auth/invalid-email')) msg = 'The email address format is invalid.';
            if (err.code === 'auth/user-not-found' || err.message.includes('auth/user-not-found')) msg = 'No registered account found with this email.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // 1. FAST-TRACK: Check Local Storage first (Instant)
            const localUsers = AuthService.getUsers();
            const localUser = localUsers.find(u => u.email === firebaseUser.email);

            if (localUser && AuthService.isProfileComplete(localUser)) {
                console.log('Fast-path: Found registered user locally.');
                AuthService.directLogin(localUser);
                onLogin(localUser);
                setIsGoogleLoading(false);
                return;
            }

            // 2. CLOUD-TRACK: Parallel cloud lookup for maximum speed
            let userDataFromCloud: AppUser | null = null;
            try {
                const userRef = doc(db, 'users', firebaseUser.uid);
                // Launch both lookups simultaneously to save time
                const [userSnap, cloudUserByEmail] = await Promise.all([
                    getDoc(userRef),
                    AuthService.getUserByEmail(firebaseUser.email!)
                ]);

                if (userSnap.exists()) {
                    userDataFromCloud = userSnap.data() as AppUser;
                } else if (cloudUserByEmail) {
                    userDataFromCloud = cloudUserByEmail;
                }
            } catch (cloudErr) {
                console.warn('Optimized cloud check failed:', cloudErr);
            }

            if (userDataFromCloud && AuthService.isProfileComplete(userDataFromCloud)) {
                console.log('Cloud-path: Found registered user.');
                AuthService.directLogin(userDataFromCloud);
                onLogin(userDataFromCloud);
                setIsGoogleLoading(false);
                return;
            }

            // 3. ONBOARDING: New user or incomplete profile
            console.log('Redirecting to onboarding...');
            setOnboardingUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Google User',
                email: firebaseUser.email || '',
                role: ADMIN_EMAILS.includes((firebaseUser.email || '').toLowerCase()) ? 'admin' : 'user',
                joinedAt: new Date().toISOString(),
                avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            });

            setFormData(prev => ({
                ...prev,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                phone: '',
                college: '',
                yearOfStudy: '',
                batchYear: '',
                gender: 'male'
            }));

            setIsOnboarding(true);
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            const errorCode = err?.code;
            const errorMessage = err?.message || 'Unknown error';

            if (errorCode === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (errorCode === 'auth/unauthorized-domain') {
                setError('Domain not authorized. Please check Firebase console.');
            } else {
                setError(`Login failed: ${errorMessage}`);
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.phone || !formData.college || !formData.yearOfStudy || !formData.batchYear) {
                setError('All terminal protocols must be complete. Please fill in all details.');
                setIsLoading(false);
                return;
            }

            const newUser: AppUser = {
                ...onboardingUser,
                name: formData.name,
                phone: formData.phone,
                college: formData.college,
                batchYear: formData.batchYear,
                gender: formData.gender,
                yearOfStudy: formData.yearOfStudy,
                lastLoginAt: new Date().toISOString()
            } as AppUser;

            console.log('Completing setup for user:', newUser);

            // Use directLogin style saving to ensure we overwrite/create correctly
            AuthService.directLogin(newUser);

            // Sync is handled by directLogin (fire & forget)

            setIsLoading(false);
            setIsOnboarding(false);
            onLogin(newUser);
        } catch (err: any) {
            console.error('Onboarding failed:', err);
            setError(err.message || 'Failed to complete setup. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    if (isOnboarding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-view-transition">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black text-white shadow-xl mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
                            <Image src="/app-logo.jpg" alt="Logo" fill className="object-cover" />
                        </div>
                        <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white">
                            Almost There!
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Please complete your profile to finish setting up your account.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                            <div className="space-y-4 animate-in fade-in">

                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-4 mb-6">
                                    {onboardingUser.avatarUrl && <div className="relative w-12 h-12 rounded-full overflow-hidden"><Image src={onboardingUser.avatarUrl} alt="" fill className="object-cover" /></div>}
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{onboardingUser.name}</p>
                                        <p className="text-zinc-500 text-xs">{onboardingUser.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Additional Details</label>

                                    <div className="relative">
                                        <input
                                            name="phone"
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none pl-10 transition-all hover:bg-zinc-900"
                                        />
                                        <Phone size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                    </div>

                                    <div className="relative">
                                        <input
                                            name="college"
                                            placeholder="Medical College"
                                            value={formData.college}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none pl-10 transition-all hover:bg-zinc-900"
                                        />
                                        <Users size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="batchYear" placeholder="Batch Year" value={formData.batchYear} onChange={handleChange} className="bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none w-full transition-all hover:bg-zinc-900" />
                                        <select name="yearOfStudy" value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all hover:bg-zinc-900" required>
                                            <option value="" disabled>Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setFormData({ ...formData, gender: 'male' })} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.gender === 'male' ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-900'}`}>
                                            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                                                {formData.gender === 'male' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            Male
                                        </button>
                                        <button type="button" onClick={() => setFormData({ ...formData, gender: 'female' })} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.gender === 'female' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-900'}`}>
                                            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                                                {formData.gender === 'female' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            Female
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsOnboarding(false)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold py-3.5 rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Complete Setup <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {/* Static depth atmosphere — no animation = no repaint */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(180,20,20,0.20),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(30,30,80,0.15),transparent)]" />
            <div className="grid-overlay absolute inset-0 opacity-50" />
            {/* Scan-lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.4) 2px,rgba(255,255,255,0.4) 3px)', backgroundSize: '100% 3px' }} />

            <div className="relative z-10 w-full max-w-md mx-auto space-y-8 animate-slide-up-fade">
                {/* Brand badge */}
                <div className="space-y-5 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 mb-2 mx-auto">
                        <span className="w-2 h-2 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px rgba(220,38,38,0.9)' }} />
                        Neural OS Online
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black font-display text-white tracking-tight leading-[1.1]">
                        {isResetting ? 'Restore Neural Link' : (isForgot ? 'Secure Access' : (isLogin ? (
                            <>
                                <span className="shimmer-text">
                                    {getGreeting()}, {lastUser?.name?.split(' ')[0] || 'Doctor'}
                                </span>
                                <span className="block text-xl font-normal text-zinc-500 mt-4 text-center">Ready to continue your research?</span>
                            </>
                        ) : (
                            <>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 text-center uppercase tracking-tighter">The Pursuit of Medical Excellence</span>
                                <span className="block text-base md:text-lg font-bold text-zinc-600 mt-4 text-center tracking-widest uppercase opacity-80">Where Wisdom Meets Intelligence</span>
                            </>
                        )))}
                    </h1>
                </div>

                {/* 3D Glass card */}
                <div
                    className="glass-card rounded-[2.5rem] p-8 md:p-10 border-glow"
                    style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4), inset 0 1.5px 0 rgba(255,255,255,0.1)' }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && !isForgot && (
                            <div className="space-y-4 animate-in fade-in">
                                <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Personal Details</label>
                                <div className="relative">
                                    <input
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none pl-10 transition-all hover:bg-zinc-900"
                                    />
                                    <User size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        name="phone"
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none pl-10 transition-all hover:bg-zinc-900"
                                    />
                                    <Phone size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="college" placeholder="Medical College" value={formData.college} onChange={handleChange} className="bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none w-full transition-all hover:bg-zinc-900" />
                                    <input name="batchYear" placeholder="Batch Year (e.g. 2024)" value={formData.batchYear} onChange={handleChange} className="bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none w-full transition-all hover:bg-zinc-900" />
                                </div>

                                <select name="yearOfStudy" value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all hover:bg-zinc-900">
                                    <option value="" disabled>Select Year of Study</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setFormData({ ...formData, gender: 'male' })} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.gender === 'male' ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-900'}`}>
                                        <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                                            {formData.gender === 'male' && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        Male
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, gender: 'female' })} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.gender === 'female' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-900'}`}>
                                        <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                                            {formData.gender === 'female' && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        Female
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {!isLogin && !isForgot && <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Account Credentials</label>}

                            <div className="relative group">
                                <input
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="Email Address"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/4 border border-white/8 text-white px-5 py-4 rounded-2xl outline-none pl-12 transition-all hover:bg-white/7 focus:bg-white/6 focus:border-red-500/50"
                                    style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)' }}
                                />
                                <Users size={18} className="absolute left-4 top-4.5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                            </div>

                            {!isForgot && (
                                <div className="relative group">
                                    <input
                                        name="password"
                                        type="password"
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        placeholder="Password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/4 border border-white/8 text-white px-5 py-4 rounded-2xl outline-none pl-12 transition-all hover:bg-white/7 focus:bg-white/6 focus:border-red-500/50"
                                        style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)' }}
                                    />
                                    <Lock size={18} className="absolute left-4 top-4.5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                </div>
                            )}
                        </div>

                        {isLogin && !isForgot && (
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setIsForgot(true); setError(''); setSuccessMsg(''); }} className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <AnimatePresence>
                            {error && <Toast message={error} type="error" onClose={() => setError('')} />}
                            {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="btn-3d relative w-full bg-white text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-colors hover:bg-red-600 hover:text-white flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : (isResetting ? 'Confirm New Neural Key' : (isForgot ? 'Execute Reset' : (isLogin ? <>Enter System <ArrowRight size={16} /></> : 'Initialize Account')))}
                            </span>
                            {/* Shine sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </button>

                        {!isForgot && (
                            <>
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"><span className="bg-background px-4">Neural Auth</span></div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isGoogleLoading || isLoading}
                                    onClick={handleGoogleLogin}
                                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-4 group"
                                >
                                    {isGoogleLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span className="text-xs uppercase tracking-widest font-black">Continue with Google</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        <div className="text-center">
                            <button type="button" onClick={() => {
                                if (isForgot) {
                                    setIsForgot(false);
                                } else {
                                    setIsLogin(!isLogin);
                                }
                                setError('');
                                setSuccessMsg('');
                            }}
                                className="text-zinc-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                            >
                                {isForgot ? 'Back to Login' : (isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// 7. Profile View (Dashboard Edition)
const ProfileView = ({
    user,
    onLogout,
    onUpdate,
    onForceSync,
    isSyncing,
    subjects,
    onSyncSubjects,
    setView,
    onBookClick,
    onManageBook,
    selectedUser,
    setSelectedUser,
    selectedUserLogs,
    onExportData,
    onWipeExamHub,
    showToast
}: {
    user: AppUser,
    onLogout: () => void,
    onUpdate: (u: AppUser) => void,
    onForceSync?: () => void,
    isSyncing?: boolean,
    subjects: Record<string, SubjectData>,
    onSyncSubjects: () => Promise<void>,
    setView: (v: ViewState) => void,
    onBookClick: (b: Book) => void,
    onManageBook: (mode: 'add' | 'edit', subjectId: string, sectionId: string, book?: Book) => void,
    selectedUser: AppUser | null,
    setSelectedUser: (u: AppUser | null) => void,
    selectedUserLogs: UserActivity[],
    onExportData?: () => void,
    onWipeExamHub?: () => void,
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) => {
    const { minutes } = useStudyTime();
    const { recentIds } = useRecentlyViewed();
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [allActivities, setAllActivities] = useState<UserActivity[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editData, setEditData] = useState<AppUser>(user);
    const [adminViewMode, setAdminViewMode] = useState<'users' | 'activities' | 'analytics'>('users');
    const [searchTerm, setSearchTerm] = useState('');

    const recentBooksWithLoc: { book: Book, sId: string, secId: string }[] = [];
    recentIds.forEach(id => {
        Object.entries(subjects).forEach(([sId, sub]) => {
            Object.entries(sub.materials).forEach(([secId, rawBooks]) => {
                const books = rawBooks as Book[];
                const found = books.find(b => b.id === id);
                if (found) recentBooksWithLoc.push({ book: found, sId, secId });
            });
        });
    });

    // Calculate Active Users (Active in last 15 mins)
    const activeUsersList = allUsers.filter(u => {
        const lastSeen = (u as any).lastActiveAt || u.lastLoginAt;
        if (!lastSeen) return false;
        return (new Date().getTime() - new Date(lastSeen).getTime()) < 15 * 60 * 1000;
    });
    const activeUsersCount = activeUsersList.length;


    // Sync editData if user prop changes
    useEffect(() => {
        setEditData(user);

        // Fetch all users and activities if admin
        if (user.role === 'admin') {
            AuthService.getAllUsersCentralized().then(setAllUsers);
            ActivityService.getActivities(200).then(setAllActivities);
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            console.log('Saving profile data...', editData);
            await AuthService.updateUser(editData);
            onUpdate(editData);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Error saving profile changes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({ ...editData, avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="pt-6 md:pt-24 px-4 max-w-7xl mx-auto space-y-8 md:space-y-12 animate-view-transition pb-40 overflow-x-hidden">
            {/* Header / Main Profile Section */}
            <div className="relative group overflow-hidden glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 border-white/10 shadow-2xl transition-all">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/20 blur-[150px] -mr-96 -mt-96 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] -ml-64 -mb-64"></div>
                
                {/* Scan Bar Animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-scan" />
                </div>
                
                {!isEditing && (
                    <div className="absolute top-4 right-4 md:top-10 md:right-10 z-50 flex items-center gap-2 md:gap-4">
                         <button
                            onClick={onLogout}
                            className="px-4 py-2 md:px-6 md:py-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 md:px-6 md:py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 transition-all shadow-lg active:scale-95"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}

                {isEditing ? (
                    <div className="w-full space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col items-center gap-6 mt-12 md:mt-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 group cursor-pointer">
                                <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-zinc-800 overflow-hidden relative">
                                    {editData.avatarUrl ? (
                                        <Image src={editData.avatarUrl} alt={editData.name} fill className="object-cover" />
                                    ) : (
                                        <div className="text-6xl font-bold text-zinc-400">{editData.name.charAt(0)}</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrendingUp className="text-white" />
                                    </div>
                                </div>
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-900 cursor-pointer hover:scale-110 transition-transform">
                                    <div className="text-white font-bold text-xl">+</div>
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Edit Your Profile</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">Update your details to personalize your experience</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Email (Read Only)</label>
                                <input
                                    value={editData.email}
                                    disabled
                                    className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 outline-none text-zinc-400 cursor-not-allowed font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Phone</label>
                                <input
                                    value={editData.phone || ''}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Medical College</label>
                                <input
                                    value={editData.college || ''}
                                    onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Batch Year</label>
                                <input
                                    value={editData.batchYear || ''}
                                    onChange={(e) => setEditData({ ...editData, batchYear: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Current Study Year</label>
                                <select
                                    value={editData.yearOfStudy || ''}
                                    onChange={(e) => setEditData({ ...editData, yearOfStudy: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all appearance-none"
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-6">
                            <button
                                disabled={isLoading}
                                onClick={() => setIsEditing(false)}
                                className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={handleSave}
                                className={`px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-600/20 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10 w-full mt-12 md:mt-0">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-2xl ring-8 ring-white dark:ring-zinc-800/80 overflow-hidden shrink-0">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                            ) : (
                                <div className="text-5xl font-bold text-zinc-400">{user.name.charAt(0)}</div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                    <h1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                                    {user.role === 'admin' && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-full uppercase shadow-lg shadow-red-500/30 tracking-widest">Admin</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 dark:text-zinc-400 text-lg">
                                    <Users size={18} className="text-red-500" />
                                    <span className="font-medium">{user.college || 'Medical Student'}</span>
                                    {user.batchYear && <span className="opacity-50">• {user.batchYear}</span>}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {user.yearOfStudy && (
                                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">Year {user.yearOfStudy}</span>
                                    </div>
                                )}
                                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="mt-4 md:mt-0 px-8 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-2xl transition-all hover:scale-105"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            {!isEditing && (
                <div className="space-y-24">
                    {/* BENTO GRID: Directorate Hub */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* The Council (Full Width) */}
                        <div className="lg:col-span-12 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-white/5 p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl">
                            <MedicalDirectorate />
                        </div>
                    </div>
                </div>
            )}
            {/* Admin View: User List & Intelligence */}
            {user.role === 'admin' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 delay-100 pb-20">


                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-[2rem] border border-zinc-100 dark:border-white/5">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                                Intelligence Hub
                                <span className="bg-red-500/10 text-red-500 text-[10px] px-3 py-1 rounded-full border border-red-500/20 animate-pulse font-bold tracking-widest">LIVE</span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    Total Users: <span className="text-slate-900 dark:text-white font-black">{allUsers.length}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Active: <span className="text-green-500 font-black">{activeUsersCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="relative group/search flex-1 min-w-[240px]">
                                <input
                                    type="text"
                                    placeholder="Search command registry..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-11 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all w-full shadow-sm"
                                />
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-red-500 transition-colors" />
                            </div>

                            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-200/50 dark:bg-zinc-800 rounded-[1.25rem] border border-zinc-200/50 dark:border-zinc-700 shadow-inner">
                                <button
                                    onClick={() => setAdminViewMode('users')}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminViewMode === 'users' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xl scale-[1.02]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Registry
                                </button>
                                <button
                                    onClick={() => setAdminViewMode('activities')}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminViewMode === 'activities' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xl scale-[1.02]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Logs
                                </button>
                                <button
                                    onClick={() => setAdminViewMode('analytics' as any)}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminViewMode === 'analytics' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xl scale-[1.02]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {adminViewMode === 'users' ? (
                        <div className="space-y-6">
                            {/* Registry - Desktop Table */}
                            <div className="hidden md:block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-white/5">
                                        <tr>
                                            <th className="px-8 py-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">User Identity</th>
                                            <th className="px-6 py-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Year & Batch</th>
                                            <th className="px-6 py-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Access Level</th>
                                            <th className="px-6 py-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Interactions</th>
                                            <th className="px-6 py-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                        {allUsers
                                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                            .sort((a,b) => (parseInt(a.yearOfStudy||'0')-parseInt(b.yearOfStudy||'0')) || a.name.localeCompare(b.name))
                                            .map((u) => {
                                                const diff = u.lastLoginAt ? (new Date().getTime() - new Date(u.lastLoginAt).getTime()) / (1000 * 3600 * 24) : 99;
                                                       const status = diff > 30 ? 'dead' : (diff > 7 ? 'inactive' : 'active');
                                                return (
                                                    <tr key={u.id} className="group hover:bg-zinc-50 dark:hover:bg-red-500/5 transition-all cursor-pointer" onClick={() => setSelectedUser(u)}>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-white/5 overflow-hidden">
                                                                    {u.avatarUrl ? <Image src={u.avatarUrl} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black bg-zinc-800 text-white">{u.name[0]}</div>}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{u.name}</div>
                                                                    <div className="text-[10px] text-zinc-500 font-mono tracking-tighter opacity-60">REF: {u.id.substring(0, 8)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-black text-slate-900 dark:text-white">Year {u.yearOfStudy || '?'}</div>
                                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Batch {u.batchYear || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                                                                {u.role === 'admin' ? 'MD' : 'USR'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                                                                {allActivities.filter(act => act.userId === u.id).length}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : (status === 'dead' ? 'bg-zinc-500' : 'bg-amber-500')}`}></div>
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'dead' ? 'text-zinc-500' : (status === 'inactive' ? 'text-amber-500' : 'text-green-500')}`}>{status}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Registry - Mobile Compact List */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {allUsers
                                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                    .sort((a,b) => (parseInt(a.yearOfStudy||'0')-parseInt(b.yearOfStudy||'0')) || a.name.localeCompare(b.name))
                                    .map((u) => {
                                        const diff = u.lastLoginAt ? (new Date().getTime() - new Date(u.lastLoginAt).getTime()) / (1000 * 3600 * 24) : 99;

                                        return (
                                            <div 
                                                key={u.id} 
                                                className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 active:scale-[0.98] transition-all"
                                                onClick={() => setSelectedUser(u)}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                                                        {u.avatarUrl ? <Image src={u.avatarUrl} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm font-black bg-zinc-700 text-white">{u.name[0]}</div>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white text-sm truncate leading-tight uppercase tracking-tight">{u.name}</h4>
                                                        <div className="text-[9px] text-zinc-500 font-mono tracking-tighter opacity-70 truncate uppercase">ID: {u.id.substring(0,8)}</div>
                                                    </div>
                                                </div>
                                                
                                                    <div className="text-right shrink-0">
                                                        <div className="text-[10px] font-black text-red-600 uppercase italic">Year {u.yearOfStudy || '?'}</div>
                                                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                            {allActivities.filter(act => act.userId === u.id).length} INT
                                                        </div>
                                                    </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ) : adminViewMode === 'activities' ? (
                        <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-2xl">
                            <div className="max-h-[600px] overflow-y-auto p-6 md:p-8 space-y-4">
                                {allActivities
                                    .filter(act => act.userName.toLowerCase().includes(searchTerm.toLowerCase()) || act.targetName.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((act) => (
                                        <div key={act.id} className="flex gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5 group hover:border-red-500/30 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center border border-white/10 shadow-sm shrink-0">
                                                {act.action === 'view_book' ? <BookOpen size={18} className="text-blue-500" /> : (act.action === 'start_quiz' ? <Zap size={18} className="text-amber-500" /> : <Activity size={18} className="text-red-500" />)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                        {act.userName} <span className="font-normal text-zinc-500">accessed</span> <span className="text-red-600 font-extrabold">{act.targetName}</span>
                                                    </p>
                                                    <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold opacity-60">{new Date(act.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest opacity-70">{act.action.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Users</p>
                                    <h4 className="text-4xl font-serif text-slate-900 dark:text-white">{allUsers.length}</h4>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active (24h)</p>
                                    <h4 className="text-4xl font-serif text-green-600">
                                        {allUsers.filter(u => u.lastLoginAt && (new Date().getTime() - new Date(u.lastLoginAt).getTime()) < 86400000).length}
                                    </h4>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Interactions</p>
                                    <h4 className="text-4xl font-serif text-blue-600">{allActivities.length}</h4>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Access Rate</p>
                                    <h4 className="text-4xl font-serif text-red-600">
                                        {Math.round((allUsers.filter(u => u.lastLoginAt && (new Date().getTime() - new Date(u.lastLoginAt).getTime()) < 86400000).length / allUsers.length) * 100)}%
                                    </h4>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-2xl p-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Top Resources</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const counts: Record<string, number> = {};
                                        allActivities.forEach(act => {
                                            counts[act.targetName] = (counts[act.targetName] || 0) + 1;
                                        });
                                        return Object.entries(counts)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 10)
                                            .map(([name, count]) => (
                                                <div key={name} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                                            <BookOpen size={14} className="text-red-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-zinc-200 text-sm truncate">{name}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-red-600">{count} clicks</span>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) && (
                        <div className="flex items-center gap-3">
                            <button
                                disabled={isLoading}
                            onClick={async () => {
                                if (confirm('⚠️ DANGER: This will permanently reset study statistics (time, history, logs) for ALL registered users in the database. Are you absolutely sure?')) {
                                    setIsLoading(true);
                                    try {
                                        await AuthService.resetAllGlobalStats();
                                        alert('Success: All global study statistics have been reset.');
                                        window.location.reload();
                                    } catch (err: any) {
                                        alert('Error resetting statistics: ' + err.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }
                            }}
                            className={`px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-red-600/40 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Trash2 size={16} />}
                            {isLoading ? 'Resetting...' : 'Reset All Global Stats'}
                        </button>

                        <button
                            disabled={isSyncing}
                            onClick={onForceSync}
                            className={`px-6 py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-600/40 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSyncing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <RefreshCw size={16} />}
                            {isSyncing ? 'Syncing...' : 'Force Cloud Sync'}
                        </button>

                        <button
                            disabled={isSyncing}
                            onClick={onWipeExamHub}
                            className={`px-6 py-3 bg-orange-600/10 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-600/40 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Trash2 size={16} />
                            Wipe Exam Hub Content
                        </button>

                        <label className="px-6 py-3 bg-green-600/10 hover:bg-green-600 text-green-600 hover:text-white border border-green-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-green-600/40 cursor-pointer">
                            <Upload size={16} />
                            Batch JSON Upload
                            <input 
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                onChange={async (e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        const res = await BatchUploadService.parseAndUpload(e.target.files[0], subjects, onSyncSubjects);
                                        if (res.success) {
                                            showToast(`Neural Link Success: ${res.count} books synchronized.`, "success");
                                        } else {
                                            console.error("Batch Upload Error:", res.error);
                                            // Silenced as per user request to remove visible error messages, 
                                            // but logged for debugging.
                                        }
                                    }
                                }} 
                            />
                        </label>

                        <button
                            onClick={onExportData}
                            className="px-6 py-3 bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-600/40"
                        >
                            <Copy size={16} />
                            Export for Antigravity
                        </button>
                    </div>
                )}
            </div>
        )}

        </div>
    );
};

// Simple Glassmorphism Toast Notification
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getColors = () => {
        if (type === 'success') return { bg: 'bg-zinc-900/80', iconBg: 'bg-green-500', label: 'Success' };
        if (type === 'error') return { bg: 'bg-red-900/80', iconBg: 'bg-red-500', label: 'Attention Needed' };
        return { bg: 'bg-zinc-900/80', iconBg: 'bg-blue-500', label: 'Information' };
    };

    const colors = getColors();

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pl-4 pr-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border border-white/10 ${colors.bg} text-white`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg} shadow-lg`}>
                {type === 'success' && <CheckCircle size={20} className="text-white" />}
                {type === 'error' && <AlertCircle size={20} className="text-white" />}
                {type === 'info' && <Info size={20} className="text-white" />}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm">{colors.label}</span>
                <span className="text-xs text-white/70 font-medium">{message}</span>
            </div>
        </motion.div>
    );
};

// --- INCOMPLETE PROFILE SYSTEM ---

const ProfileSetupOverlay = ({ onUpdate }: { onUpdate: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center pointer-events-auto"
        >
            <div className="max-w-md space-y-10">
                <div className="w-28 h-28 bg-red-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-600/40 mx-auto animate-pulse">
                    <ShieldAlert size={56} className="text-white" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-5xl font-serif font-black text-white tracking-tighter uppercase leading-none">Identity Check</h2>
                    <p className="text-zinc-200 text-xl font-medium drop-shadow-lg">
                        Your neural entry is fragmented. Complete your medical student profile to synchronize with the command hub.
                    </p>
                </div>
                <button 
                    onClick={onUpdate}
                    className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm"
                >
                    Initialize Setup
                </button>
            </div>
        </motion.div>
    );
};

const QuickProfileModal = ({ user, onUpdate, onClose }: { user: AppUser, onUpdate: (data: AppUser) => void, onClose: () => void }) => {
    const [formData, setFormData] = React.useState<Partial<AppUser>>({});
    const [isSaving, setIsSaving] = React.useState(false);

    const missingFields = [
        { key: 'phone', label: 'Neural Link (Phone)', placeholder: '+1 234 567 890', icon: Phone },
        { key: 'college', label: 'Medical Institution', placeholder: 'Harvard Medical...', icon: GraduationCap },
        { key: 'yearOfStudy', label: 'Study Phase', type: 'select', options: ['1', '2', '3', '4'], icon: Activity },
        { key: 'batchYear', label: 'Batch Identity', placeholder: '2024-2029', icon: Clock }
    ].filter(f => !user[f.key as keyof AppUser]);

    const handleSave = async () => {
        if (Object.keys(formData).length === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const updatedUser = { ...user, ...formData };
            await AuthService.updateUser(updatedUser);
            onUpdate(updatedUser);
            onClose();
        } catch (err) {
            console.error("Quick update failed:", err);
            alert("Update failed. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                >
                     {/* Atmosphere */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -mr-32 -mt-32"></div>

                     <div className="relative z-10 space-y-8">
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-white tracking-tighter uppercase leading-none">Repair Identity</h2>
                            <p className="text-zinc-500 text-sm font-medium">Verify your synchronization details for clinical logging.</p>
                        </div>

                        <div className="space-y-6">
                            {missingFields.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <motion.div 
                                        key={f.key}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Icon size={12} className="text-red-500" /> {f.label}
                                        </label>
                                        {f.type === 'select' ? (
                                            <select
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-zinc-900">Select {f.label}</option>
                                                {f.options?.map(opt => (
                                                    <option key={opt} value={opt} className="bg-zinc-900">Phase {opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder={f.placeholder}
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-zinc-800"
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="fill-white" />}
                                {isSaving ? "Synchronizing..." : "Initialize Identity"}
                            </button>
                        </div>
                     </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};


// 10. Multi-Part Book Selection Modal (Premium)
const MultiPartModal = ({ book, onClose, onSelect }: { book: Book, onClose: () => void, onSelect: (part: BookPart) => void }) => {
    if (!book.parts) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6"
            >
                {/* Backdrop with Deep Blur */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-zinc-900/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl"
                >
                    {/* Header Section */}
                    <div className="relative h-48 md:h-64 overflow-hidden">
                        <div className={`absolute inset-0 ${book.coverColor} opacity-20`} />
                        {book.coverUrl && (
                            <Image 
                                src={book.coverUrl} 
                                alt={book.title} 
                                fill 
                                className="object-cover opacity-40 blur-sm"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                        
                        <div className="absolute bottom-6 left-8 right-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                                {book.title}
                            </h2>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {book.parts.length} Volumes Available
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {book.parts.map((part, idx) => (
                                <motion.button
                                    key={part.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => onSelect(part)}
                                    className="group relative flex flex-col items-start p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all text-left overflow-hidden"
                                >
                                    {/* Glass Highlight */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-500 font-bold group-hover:bg-red-600 group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <ArrowRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                                        {part.title}
                                    </h3>
                                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                                        Read Digital Volume
                                    </p>
                                </motion.button>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                                For academic use only • Dr. Astro System
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// 9. Copyright / Educational Disclaimer Overlay
const CopyrightOverlay = ({ onFinish }: { onFinish: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onFinish, 3500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-lg space-y-8 relative z-10"
            >
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl backdrop-blur-3xl mb-4 group hover:border-red-500/50 transition-colors">
                    <AlertCircle size={48} className="text-red-500 group-hover:scale-110 transition-transform" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black font-display text-white tracking-tighter uppercase px-1 px-4">
                        Academic <span className="text-red-600">Disclaimer</span>
                    </h2>
                    <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full" />
                </div>

                <div className="space-y-6">
                    <p className="text-zinc-300 text-xl leading-relaxed font-medium">
                        Dr. Astro is a <span className="text-white font-bold">non-profit educational platform</span>.
                        Clinical resources and materials provided are for
                        <span className="text-red-500 font-black"> academic research and study purposes only.</span>
                    </p>

                    <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
                        This system does not replace professional medical training or clinical judgment.
                        Users must verify all data with official curriculum sources.
                    </p>
                </div>

                <div className="pt-10 flex flex-col items-center gap-4">
                    <div className="h-0.5 w-12 bg-red-600/50" />
                    <p className="text-white text-[12px] font-black uppercase tracking-[0.2em]">
                        Empowering Future Healers
                    </p>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em]">
                        For the Students, Only for the Students
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

/**
 * ==========================================
 * MAIN APP CONTAINER
 * ==========================================
 */


// 12. Neural Lab (AI Simulation Lab)
const NeuralLabView = React.lazy(() => import('./views/NeuralLabView'));


// --- Firestore Data Sanitizer ---
const sanitizeData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (Array.isArray(data)) return data.map(sanitizeData);
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const key in data) {
            const value = sanitizeData(data[key]);
            if (value !== undefined) {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    return data;
};

export default function DrAstroApp() {
    const [loading, setLoading] = useState(true);

    // Splash Screen Logic (Always show on refresh as requested)
    useEffect(() => {
        setLoading(true);
    }, []);

    const handleSplashFinish = () => {
        setLoading(false);
    };
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!AuthService.getCurrentUser());
    const [currentUser, setCurrentUser] = useState<AppUser | null>(() => AuthService.getCurrentUser());
    const [view, setView] = useState<ViewState>('HOME');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    // history state removed
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [quizConfig, setQuizConfig] = useState<{ subjectId: string, count: number } | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [selectedUserLogs, setSelectedUserLogs] = useState<UserActivity[]>([]);
    const [subjectsSyncError, setSubjectsSyncError] = useState<string | null>(null);
    const [showQuickProfile, setShowQuickProfile] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [multiPartBook, setMultiPartBook] = useState<Book | null>(null);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [simulationConfig, setSimulationConfig] = useState<{ subject?: string, bookTitle?: string } | null>(null);
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 mins
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Initial Theme Detection with Persistence
    useEffect(() => {
        const savedTheme = localStorage.getItem('dr-astro-theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || 'dark';
        setTheme(initialTheme);
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
    };

    const { addRecent } = useRecentlyViewed();
    const { saveScore } = useQuizPerformance();

    // Favorites Logic
    const toggleFavorite = async (bookId: string) => {
        if (!currentUser) return;
        const currentFavs = currentUser.favorites || [];
        let nextFavs;
        if (currentFavs.includes(bookId)) {
            nextFavs = currentFavs.filter(id => id !== bookId);
            showToast("Removed from Study Shelf", "success");
        } else {
            nextFavs = [...currentFavs, bookId];
            showToast("Pinned to Study Shelf!", "success");
        }
        
        const updated = { ...currentUser, favorites: nextFavs };
        setCurrentUser(updated);
        await AuthService.updateUser(updated);
    };

    // Pomodoro Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime(t => t - 1);
            }, 1000);
        } else if (pomodoroTime === 0) {
            setIsTimerRunning(false);
            showToast("Study Session Complete! Take a break.", "success");
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, pomodoroTime]);

    // Global Search Keyboard Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    useEffect(() => {
        if (selectedUser) {
            setSelectedUserLogs([]); // Clear previous
            ActivityService.getUserActivities(selectedUser.id).then(setSelectedUserLogs);
            if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        } else {
            if (typeof document !== 'undefined') document.body.style.overflow = 'unset';
        }
        return () => {
            if (typeof document !== 'undefined') document.body.style.overflow = 'unset';
        };
    }, [selectedUser]);

    // -- ADMIN BOOK MANAGEMENT --
    const fetchSubjects = async () => {
        try {
            const subjectsCol = collection(db, 'subjects-v2');
            const querySnap = await getDocs(subjectsCol);
            if (!querySnap.empty) {
                const cloudData: Record<string, SubjectData> = {};
                querySnap.forEach(docSnap => {
                    cloudData[docSnap.id] = docSnap.data() as SubjectData;
                });

                // SMART MERGE: Preserve architecture from code while keeping cloud data
                const merged = { ...SUBJECTS };
                Object.keys(cloudData).forEach(key => {
                    const cloudSub = cloudData[key];
                    const codeSub = SUBJECTS[key];
                    
                    if (codeSub) {
                        merged[key] = {
                            ...codeSub,
                            ...cloudSub,
                            // Prioritize Code for Architecture if Cloud is empty/stale
                            practicalSections: (cloudSub.practicalSections && cloudSub.practicalSections.length > 0) 
                                ? cloudSub.practicalSections 
                                : codeSub.practicalSections,
                            examSections: (cloudSub.examSections && cloudSub.examSections.length > 0)
                                ? cloudSub.examSections
                                : codeSub.examSections,
                            // Merge Materials to prevent data loss
                            materials: {
                                ...(codeSub.materials || {}),
                                ...(cloudSub.materials || {})
                            }
                        };
                    } else {
                        merged[key] = cloudSub;
                    }
                });

                // DYNAMIC NORMALIZER
                Object.keys(merged).forEach(sId => {
                    const sub = merged[sId];
                    if (sub.materials && sub.materials.grossAnatomy) {
                        const gross = [...sub.materials.grossAnatomy];
                        const bdcBooks = gross.filter(b => b.title.includes("BD Chaurasia") || b.title.includes("BDC"));
                        
                        if (bdcBooks.length > 1 && !bdcBooks.some(b => b.parts && b.parts.length > 0)) {
                            const master = bdcBooks[0];
                            const parts = bdcBooks.map((b, i) => ({
                                id: b.id,
                                title: b.title.includes("Vol") ? b.title : `Volume ${i + 1}`,
                                downloadUrl: b.downloadUrl
                            }));

                            const filtered = gross.filter(b => !bdcBooks.find(bdc => bdc.id === b.id));
                            sub.materials.grossAnatomy = [
                                ...filtered,
                                { ...master, title: "BD Chaurasia - Gross Anatomy", parts }
                            ];
                        }
                    }
                });
                return merged;
            }
            return SUBJECTS;
        } catch (error: any) {
            console.error("Cloud Sync Error:", error);
            setSubjectsSyncError(error.code === 'permission-denied' ? 'Permission Denied' : error.message);
            return SUBJECTS;
        }
    };

    const { data: subjectsData, error: swrError, mutate: mutateSubjects } = useSWR('subjects-v2', fetchSubjects, {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // 5-minute cache
        fallbackData: SUBJECTS
    });

    const subjects = subjectsData || SUBJECTS;
    const isSubjectsLoading = !subjectsData && !swrError;
    const [editModalConfig, setEditModalConfig] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        book?: Book;
        subjectId: string;
        sectionId: string;
    }>({ isOpen: false, mode: 'add', subjectId: '', sectionId: '' });
    const [sectionEditConfig, setSectionEditConfig] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        type: 'practical' | 'exam';
        subjectId: string;
        section?: { id: string, label: string, description?: string };
    }>({ isOpen: false, mode: 'add', type: 'practical', subjectId: '' });

    const handleManageBook = (mode: 'add' | 'edit', subjectId: string, sectionId: string, book?: Book) => {
        setEditModalConfig({ isOpen: true, mode, subjectId, sectionId, book });
    };

    const handleRenameSection = async (subjectId: string, sectionId: string, newLabel: string, newDescription?: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.practicalSections) {
            subject.practicalSections = [{ id: 'practicalMaterials', label: 'Practical Materials' }];
        }
        
        const section = (subject.practicalSections || []).find((s: any) => s.id === sectionId);
        if (section) {
            section.label = newLabel;
            section.description = newDescription;
            updatedSubjects[subjectId] = subject;
            mutateSubjects(updatedSubjects, false);
            
            try {
                await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
                showToast(`Section ${newLabel} updated`, "success");
            } catch (error) {
                console.error("Error updating section:", error);
                showToast("Failed to update section", "error");
            }
        }
    };

    const handleExamRenameSection = async (subjectId: string, sectionId: string, newLabel: string, newDescription?: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.examSections) {
            subject.examSections = [];
        }
        
        const section = (subject.examSections || []).find((s: any) => s.id === sectionId);
        if (section) {
            section.label = newLabel;
            section.description = newDescription;
            updatedSubjects[subjectId] = subject;
            mutateSubjects(updatedSubjects, false);
            
            try {
                await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
                showToast(`Section ${newLabel} updated`, 'success');
            } catch (err) {
                console.error('Failed to sync section update:', err);
                showToast('Failed to sync changes.', 'error');
            }
        }
    };

    const handleExamRemoveSection = async (subjectId: string, sectionId: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.examSections) return;
        
        subject.examSections = subject.examSections.filter(s => s.id !== sectionId);
        // Clean up materials
        const newMaterials = { ...subject.materials };
        delete (newMaterials as any)[sectionId];
        subject.materials = newMaterials;
        
        updatedSubjects[subjectId] = subject;
        mutateSubjects(updatedSubjects, false);
        
        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
            showToast('Section removed permanently', 'success');
        } catch (err) {
            console.error('Failed to remove section:', err);
            showToast('Failed to sync removal.', 'error');
        }
    };

    const handleExamAddSection = async (subjectId: string, label: string, description?: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.examSections) {
            subject.examSections = [];
        }
        
        const id = label.toLowerCase().replace(/\s+/g, '-');
        if (subject.examSections.some(s => s.id === id)) {
            showToast('Section already exists', 'error');
            return;
        }

        subject.examSections.push({ id, label, description });
        // Ensure materials entry exists
        if (!subject.materials[id]) {
            subject.materials = { ...subject.materials, [id]: [] };
        }

        updatedSubjects[subjectId] = subject;
        mutateSubjects(updatedSubjects, false);

        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
            showToast(`Exam section ${label} created`, 'success');
        } catch (err) {
            console.error('Failed to sync new section:', err);
            showToast('Failed to sync changes.', 'error');
        }
    };

    const handleWipeExamHub = async () => {
        if (!confirm("⚠️ FINAL WARNING: This will PERMANENTLY DELETE ALL sections and files within the Exam Hub across ALL subjects. This action is irreversible. Proceed?")) return;
        
        setIsSyncing(true);
        try {
            const next = { ...subjects };
            const batch = Object.keys(next).map(async (sId) => {
                const sub = { ...next[sId] };
                sub.examSections = [];
                // Optionally clear materials for those sections if needed, 
                // but since IDs are dynamic it's safer to just clear examSections list.
                // However, to really "blank" them, we should also clear common exam material keys if any.
                next[sId] = sub;
                await setDoc(doc(db, 'subjects-v2', sId), sub);
            });
            await Promise.all(batch);
            mutateSubjects(next, false);
            showToast("All Exam Hub pages are now blank.", "success");
        } catch (err) {
            console.error("Wipe failed:", err);
            showToast("Error wiping content.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAddSection = async (subjectId: string, label: string, description?: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.practicalSections) {
            subject.practicalSections = [{ id: 'practicalMaterials', label: 'Practical Materials' }];
        }
        
        const id = label.toLowerCase().replace(/\s+/g, '-');
        if (subject.practicalSections.some(s => s.id === id)) {
            showToast("Section already exists", "error");
            return;
        }
        
        subject.practicalSections = [...subject.practicalSections, { id, label, description }];
        if (!subject.materials[id]) {
            subject.materials = { ...subject.materials, [id]: [] };
        }
        
        updatedSubjects[subjectId] = subject;
        mutateSubjects(updatedSubjects, false);
        
        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
            showToast("Section added successfully", "success");
        } catch (error) {
            console.error("Error adding section:", error);
            showToast("Failed to add section", "error");
        }
    };

    const handleRemoveSection = async (subjectId: string, sectionId: string) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        if (!subject.practicalSections) return;
        
        subject.practicalSections = subject.practicalSections.filter(s => s.id !== sectionId);
        // Clean up materials
        const newMaterials = { ...subject.materials };
        delete (newMaterials as any)[sectionId];
        subject.materials = newMaterials;
        
        updatedSubjects[subjectId] = subject;
        mutateSubjects(updatedSubjects, false);
        
        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
            showToast('Section removed permanently', 'success');
        } catch (err) {
            console.error('Failed to remove section:', err);
            showToast('Failed to sync removal.', 'error');
        }
    };

    const handleSaveBook = async (book: Book, targetSubjectId: string, targetSectionId: string) => {
        if (isSubjectsLoading) {
            showToast("Cloud data still loading. Please try again in a moment.", "error");
            return;
        }

        const next = { ...subjects };
        const oldSId = editModalConfig.subjectId;
        const oldSecId = editModalConfig.sectionId;

        let subjectToUpdate: SubjectData | null = null;

        // a. Handle relocation (if removing from old place)
        if (editModalConfig.mode === 'edit' && editModalConfig.book && (oldSId !== targetSubjectId || oldSecId !== targetSectionId)) {
            if (next[oldSId]) {
                const oldSub = { ...next[oldSId] };
                const oldMaterials = { ...(oldSub.materials || {}) } as any;
                oldMaterials[oldSecId] = (oldMaterials[oldSecId] || []).filter((b: Book) => b.id !== book.id);
                oldSub.materials = oldMaterials;
                next[oldSId] = oldSub;
                
                // Immediately persist the removal if it's a different subject
                try { await setDoc(doc(db, 'subjects-v2', oldSId), oldSub); } catch { }
            }
        }

        // b. Save to target location
        if (next[targetSubjectId]) {
            const newSub = { ...next[targetSubjectId] };
            const newMaterials = { ...(newSub.materials || {}) } as any;
            const newList = [...(newMaterials[targetSectionId] || [])];

            const existingIdx = newList.findIndex(b => b.id === book.id);
            if (existingIdx >= 0) {
                newList[existingIdx] = book;
            } else {
                newList.push(book);
            }

            newMaterials[targetSectionId] = newList;
            newSub.materials = newMaterials;
            next[targetSubjectId] = newSub;
            subjectToUpdate = newSub;

            setEditModalConfig(prev => ({ ...prev, isOpen: false }));
            mutateSubjects(next, false);

            // Persist to Cloud with extreme reliability
            try {
                // Ensure we are writing to the v2 collection
                await setDoc(doc(db, 'subjects-v2', targetSubjectId), sanitizeData(subjectToUpdate));
                showToast("Changes Secured in Cloud!", "success");
            } catch (err: any) {
                console.error("Cloud Save Failure:", err);
                // Fallback to local storage if firestore fails
                localStorage.setItem(`dr-astro-pending-sync-${targetSubjectId}`, JSON.stringify(subjectToUpdate));
                showToast(`Cloud Sync Delayed: ${err.message || 'Check connection'}`, "error");
            }
        } else {
            showToast("Invalid subject target.", "error");
        }
    };

    const handleForceCloudSync = async () => {
        if (!confirm("⚠️ DANGER: This will OVERWRITE ALL CLOUD DATA with the local code version (defaults). All books, links, and subjects added via this website will be PERMANENTLY DELETED. Use this ONLY for emergency factory resets. Are you absolutely sure?")) return;

        setIsSyncing(true);
        try {
            // Write each subject into the new collection
            const batch = Object.keys(SUBJECTS).map(async (key) => {
                await setDoc(doc(db, 'subjects-v2', key), SUBJECTS[key]);
            });
            await Promise.all(batch);
            showToast("Cloud reset to factory defaults!", "success");
        } catch (err) {
            console.error("Factory reset failed:", err);
            showToast("Sync Error.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        const nextSubjects = { ...subjects };
        const sId = editModalConfig.subjectId;
        const secId = editModalConfig.sectionId;

        if (nextSubjects[sId]) {
            const sub = { ...nextSubjects[sId] };
            const materials = { ...(sub.materials || {}) } as any;
            materials[secId] = (materials[secId] || []).filter((b: Book) => b.id !== bookId);
            sub.materials = materials;
            nextSubjects[sId] = sub;

            mutateSubjects(nextSubjects, false);
            setEditModalConfig(prev => ({ ...prev, isOpen: false }));

            try {
                await setDoc(doc(db, 'subjects-v2', sId), sanitizeData(sub));
                showToast("Book deleted from cloud!", "success");
            } catch (err) {
                console.error("Delete failed:", err);
                showToast("Failed to sync deletion.", "error");
            }
        }
    };

    const handleReorderBooks = async (subjectId: string, sectionId: string, newBooks: Book[]) => {
        if (!subjects[subjectId]) return;
        
        const updatedSubjects = { ...subjects };
        const subject = { ...updatedSubjects[subjectId] };
        
        // Update local state
        (subject.materials as any)[sectionId] = newBooks;
        updatedSubjects[subjectId] = subject;
        mutateSubjects(updatedSubjects, false);
        
        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(subject));
        } catch (err) {
            console.error("Failed to sync reorder:", err);
            showToast("Failed to sync arrangement", "error");
        }
    };

    const handleMoveBook = async (subjectId: string, sectionId: string, bookId: string, direction: 'left' | 'right') => {
        const nextSubjects = { ...subjects };
        const sub = nextSubjects[subjectId];
        if (!sub) return;

        const materials = { ...sub.materials } as Record<string, Book[]>;
        const list = [...(materials[sectionId] || [])];
        const idx = list.findIndex(b => b.id === bookId);
        if (idx === -1) return;

        const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return;

        // Swap
        [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];

        materials[sectionId] = list;
        const updatedSubject = { ...sub, materials: materials as any };
        nextSubjects[subjectId] = updatedSubject;

        mutateSubjects(nextSubjects, false);
        try {
            await setDoc(doc(db, 'subjects-v2', subjectId), updatedSubject);
            showToast("Position updated in cloud!", "success");
        } catch (err) {
            console.error("Move failed:", err);
            showToast("Failed to sync move to cloud.", "error");
        }
    };

    const handleDuplicateBook = async (subjectId: string, sectionId: string, book: Book) => {
        const duplicatedBook = {
            ...book,
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
            title: `${book.title} (Copy)`
        };
        const nextSubjects = { ...subjects };
        if (nextSubjects[subjectId]) {
            const sub = { ...nextSubjects[subjectId] };
            const m = { ...(sub.materials || {}) } as Record<string, Book[]>;
            m[sectionId] = [...(m[sectionId] || []), duplicatedBook];
            sub.materials = m as any;
            nextSubjects[subjectId] = sub;

            mutateSubjects(nextSubjects, false);
            try {
                await setDoc(doc(db, 'subjects-v2', subjectId), sanitizeData(sub));
                showToast("Book duplicated!", "success");
            } catch (err) {
                console.error("Duplicate failed:", err);
                showToast("Failed to sync duplicate to cloud.", "error");
            }
        }
    };
    
    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjects, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `dr-astro-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Data exported! Send this file to Antigravity.", "success");
    };
    // ---------------------------

    // -- BROWSER HISTORY INTEGRATION --
    // Sync React state with browser history to fix "Back" button behavior on mobile
    useEffect(() => {
        // 1. Handle Initial Load / Deep Linking
        const params = new URLSearchParams(window.location.search);
        const initialView = (params.get('view') as ViewState) || 'HOME';
        const initialSubject = params.get('subject');

        if (initialView !== 'HOME') {
            setView(initialView);
            if (initialSubject) setActiveSubject(initialSubject);
            // Replace the current entry so it has the correct state object
            window.history.replaceState({ view: initialView, activeSubject: initialSubject }, '', window.location.search);
        } else {
            window.history.replaceState({ view: 'HOME', activeSubject: null }, '', '/');
        }

        // 2. Handle Back/Forward Interaction
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state;
            if (state) {
                setView(state.view);
                setActiveSubject(state.activeSubject || null);
            } else {
                // Should ideally not happen if we replaceState correctly, but fallback:
                setView('HOME');
                setActiveSubject(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (newView: ViewState, newSubjectId: string | null = null, simConfig: any = null) => {
        if (simConfig) setSimulationConfig(simConfig);
        setView(newView);
        setActiveSubject(newSubjectId);

        // Construct URL
        const params = new URLSearchParams();
        if (newView !== 'HOME') params.set('view', newView);
        if (newSubjectId) params.set('subject', newSubjectId);

        const newUrl = params.toString() ? `?${params.toString()}` : '/';

        window.history.pushState({ view: newView, activeSubject: newSubjectId }, '', newUrl);
        // Scroll to top
        window.scrollTo(0, 0);
    };
    // ---------------------------

    useEffect(() => {
        // Enforce Primary Domain (Redirect from alternates/mirrors)
        if (typeof window !== 'undefined' && 
            window.location.hostname !== 'dr-astro.pages.dev' && 
            window.location.hostname !== 'localhost' &&
            !window.location.hostname.includes('127.0.0.1')) {
            window.location.replace('https://dr-astro.pages.dev' + window.location.pathname + window.location.search);
        }

        // Auto-login check
        const checkAuth = async () => {
            const user = AuthService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                setIsAuthenticated(true);

                // CLOUD-FIRST SYNC: Refresh profile data from Firestore to ensure DPs and details are current
                try {
                    const cloudUser = await AuthService.getUserByEmail(user.email);
                    if (cloudUser) {
                        // Merge logic: code (higher version) vs cloud
                        const merged = { ...user, ...cloudUser };
                        setCurrentUser(merged);
                        localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(merged));
                    }
                } catch (e) {
                    console.warn("Cloud sync failed, using local fallback.", e);
                }

                // Check for disclaimer
                const hasSeen = localStorage.getItem(`dr-astro-disclaimer-seen-${user.id}`);
                if (!hasSeen) {
                    setShowDisclaimer(true);
                }

                if (user.role === 'admin') {
                    console.log("Admin session verified. Professional Cloud Sync active.");
                }
            }
        };
        checkAuth();
    }, []);

    // Sync theme with HTML element
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Force Admin Elevation for established accounts (Safety check)
    useEffect(() => {
        if (currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) && currentUser.role !== 'admin') {
            const elevated = { ...currentUser, role: 'admin' as const };
            console.log("Elevating user to Admin based on verified email:", currentUser.email);
            setCurrentUser(elevated);
            // Also update local session to persist
            localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(elevated));
            // Update storage key users list as well to persist across logouts
            const users = AuthService.getUsers();
            const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (idx !== -1) {
                users[idx].role = 'admin';
                localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(users));
            }
            // Sync to firestore
            AuthService.syncUserToFirestore(elevated);
        }
    }, [currentUser]);

    const bgStyle = "bg-background text-foreground transition-colors duration-500";
    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('dr-astro-theme', next);
            if (next === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return next;
        });
    };

    const handleLogin = (user: AppUser) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate('HOME');
    };

    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
        if (!isFocusMode) {
            setPomodoroTime(25 * 60);
            setIsTimerRunning(true);
            showToast("Entering Examination Mode. All distractions hidden.", "success");
        } else {
            setIsTimerRunning(false);
            showToast("Focus session ended.", "success");
        }
    };

    const handleSimulate = (book: Book) => {
        ActivityService.log(currentUser, 'start_simulation', book.id, book.title);
        // Find subject from book id or just use 'Medicine'
        navigate('NEURAL_LAB', null, { subject: 'General Medicine', bookTitle: book.title });
    };

    const handleBookClick = (book: Book) => {
        addRecent(book.id);
        ActivityService.log(currentUser, 'view_book', book.id, book.title);
        
        if (book.parts && book.parts.length > 0) {
            setMultiPartBook(book);
            return;
        }

        if (book.downloadUrl && book.downloadUrl !== '#') {
            window.open(book.downloadUrl, '_blank');
        } else {
            alert(`Opening ${book.title}... (No link provided)`);
        }
    };


    const handleQuizComplete = (finalScore: number, total: number, xp: number = 0) => {
        if (quizConfig) {
            // Calculate scaled score out of 100
            const scaledScore = Math.round((finalScore / total) * 100);
            saveScore(quizConfig.subjectId, scaledScore);
            ActivityService.log(currentUser, 'start_quiz', quizConfig.subjectId, `Score: ${scaledScore}% | +${xp} XP`);

            // Update User XP
            if (currentUser) {
                const newTotalXP = (currentUser.totalXP || 0) + xp;
                const updatedUser = { ...currentUser, totalXP: newTotalXP };
                AuthService.updateUser(updatedUser);
                setCurrentUser(updatedUser);
                showToast(`Neural Link Sync: +${xp} Knowledge Points!`, "success");
            }
        }
    };

    if (!isAuthenticated) return (
        <div className={theme}>
            {loading && <SplashScreen user={currentUser} onFinish={handleSplashFinish} />}
            <LoginView onLogin={(user) => {
                handleLogin(user);
                const hasSeen = localStorage.getItem(`dr-astro-disclaimer-seen-${user.id}`);
                if (!hasSeen) {
                    setShowDisclaimer(true);
                }
            }} />
        </div>
    );

    // Focus Mode Overlays
    if (isFocusMode) {
        return (
            <div className={`min-h-screen ${bgStyle} flex flex-col relative overflow-hidden font-sans`}>
                {/* Zen Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent)]" />
                
                {/* Floating Timer Header */}
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-8 py-4 bg-zinc-900/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <Timer size={20} className="text-red-500" />
                        <span className="text-2xl font-black text-white font-mono tracking-widest">{formatTime(pomodoroTime)}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isTimerRunning ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-white shadow-lg shadow-red-600/30'}`}
                    >
                        {isTimerRunning ? 'Pause Session' : 'Start Knowledge Pulse'}
                    </button>
                    <button 
                        onClick={() => { setIsFocusMode(false); setIsTimerRunning(false); }}
                        className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <main className="flex-1 flex flex-col items-center justify-center p-8 z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4 mb-20"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-white selection:bg-red-600">EXAMINATION MODE</h1>
                        <p className="text-zinc-500 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase">Deep Study In Progress • Knowledge Is Silence</p>
                    </motion.div>
                    
                    {/* Minimalist Shelf */}
                    <div className="w-full max-w-7xl">
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            {(currentUser?.favorites || []).length > 0 ? (
                                (currentUser?.favorites || []).map(favId => {
                                    let foundBook = null;
                                    Object.values(subjects).forEach(sub => {
                                        Object.values(sub.materials).forEach((list: any) => {
                                            const b = list.find((b: any) => b.id === favId);
                                            if (b) foundBook = b;
                                        });
                                    });
                                    if (!foundBook) return null;
                                    return (
                                        <BookCard 
                                            key={favId} 
                                            book={foundBook} 
                                            onClick={() => handleBookClick(foundBook!)} 
                                            isFavorite={true} 
                                            onToggleFavorite={toggleFavorite} 
                                            onSimulate={() => handleSimulate(foundBook!)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Pin books to your Study Shelf to see them here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={theme}>
            {loading && <SplashScreen user={currentUser} onFinish={handleSplashFinish} />}
            <div className={`min-h-screen font-sans pb-32 md:pb-0 ${bgStyle ?? ''}`}>
                    <AnimatePresence>
                        {showDisclaimer && (
                            <CopyrightOverlay onFinish={() => {
                                if (currentUser?.id) {
                                    localStorage.setItem(`dr-astro-disclaimer-seen-${currentUser.id}`, 'true');
                                }
                                setShowDisclaimer(false);
                            }} />
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <Header 
                        currentView={view} 
                        setView={(v: ViewState) => navigate(v)} 
                        theme={theme} 
                        toggleTheme={toggleTheme} 
                        userAvatar={currentUser?.avatarUrl} 
                        isFocusMode={isFocusMode}
                        toggleFocusMode={toggleFocusMode}
                    />

                    {/* Mandatory Profile Setup Enforcement Overlay */}
                    {isAuthenticated && currentUser && !AuthService.isProfileComplete(currentUser) && view !== 'PROFILE' && !showQuickProfile && (
                        <ProfileSetupOverlay onUpdate={() => setShowQuickProfile(true)} />
                    )}

                    {/* Quick Update Identity Modal */}
                    {showQuickProfile && currentUser && (
                        <QuickProfileModal 
                            user={currentUser} 
                            onUpdate={(updated) => {
                                setCurrentUser(updated);
                                showToast("Neural identity synchronized.", "success");
                            }}
                            onClose={() => setShowQuickProfile(false)}
                        />
                    )}

                    <main className="min-h-screen transform-gpu will-change-[transform,opacity] pt-4 px-2 md:px-0">

                        {view === 'HOME' && (
                            <HomeView
                                setView={(v: ViewState) => navigate(v)} 
                                onBookClick={handleBookClick} 
                                subjects={subjects} 
                                currentUser={currentUser} 
                                onManageBook={handleManageBook}
                                onToggleFavorite={toggleFavorite}
                                onSimulate={handleSimulate}
                            />
                        )}

                        {view === 'NEURAL_LAB' && (
                            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white font-bold">Loading Neural Lab...</div>}>
                                <NeuralLabView
                                    currentUser={currentUser}
                                    onBack={() => {
                                        window.history.back();
                                    }}
                                    onSimulationComplete={(isCorrect) => {
                                        // Log simulation success/fail
                                        if (currentUser) {
                                            ActivityService.log(currentUser, 'simulation_complete', simulationConfig?.bookTitle || 'General', isCorrect ? 'Success' : 'Failure');
                                        }
                                    }}
                                />
                            </React.Suspense>
                        )}

                        {view === 'PROFILE' && currentUser && (
                            <ProfileView
                                user={currentUser}
                                onLogout={handleLogout}
                                onUpdate={setCurrentUser}
                                onForceSync={handleForceCloudSync}
                                isSyncing={isSyncing}
                                subjects={subjects}
                                onSyncSubjects={async () => { await mutateSubjects(); }}
                                setView={(v: ViewState) => navigate(v)}
                                onBookClick={handleBookClick}
                                onManageBook={handleManageBook}
                                selectedUser={selectedUser}
                                setSelectedUser={setSelectedUser}
                                selectedUserLogs={selectedUserLogs}
                                onExportData={handleExportData}
                                onWipeExamHub={handleWipeExamHub}
                                 showToast={showToast}
                            />
                        )}

                        {view === 'THEORY' && (
                            <TheoryView
                                onSelectSubject={(id: string) => {
                                    // Replaces internal history stack with browser stack
                                    ActivityService.log(currentUser, 'view_subject', id, subjects[id]?.name || id);
                                    navigate('SUBJECT_DETAIL', id);
                                }}
                                subjects={subjects}
                                currentUser={currentUser}
                            />
                        )}

                        {view === 'SUBJECT_DETAIL' && activeSubject && (
                            <div className="pt-2 md:pt-6 px-4 w-full">
                                <SubjectDetailView
                                    subjectId={activeSubject}
                                    subjects={subjects}
                                    currentUser={currentUser}
                                    onBack={() => {
                                        window.history.back();
                                    }}
                                    navigate={navigate}
                                    onBookClick={handleBookClick}
                                    onManageBook={handleManageBook}
                                    onMoveBook={handleMoveBook}
                                    onDuplicateBook={handleDuplicateBook}
                                    onReorderBooks={handleReorderBooks}
                                    onToggleFavorite={toggleFavorite}
                                    onSimulate={handleSimulate}
                                    setSectionEditConfig={setSectionEditConfig}
                                />
                            </div>
                        )}

                        {view === 'EXAM_SUBJECT_DETAIL' && activeSubject && (
                            <div className="pt-2 md:pt-6 px-4 w-full">
                                <ExamSubjectDetailView
                                    subjectId={activeSubject}
                                    subjects={subjects}
                                    currentUser={currentUser}
                                    onBack={() => {
                                        window.history.back();
                                    }}
                                    onBookClick={handleBookClick}
                                    onManageBook={handleManageBook}
                                    onMoveBook={handleMoveBook}
                                    onDuplicateBook={handleDuplicateBook}
                                    onToggleFavorite={toggleFavorite}
                                    onSimulate={handleSimulate}
                                    onRenameSection={handleExamRenameSection}
                                    onRemoveSection={handleExamRemoveSection}
                                    onAddSection={handleExamAddSection}
                                    onReorderBooks={handleReorderBooks}
                                    setSectionEditConfig={setSectionEditConfig}
                                />
                            </div>
                        )}

                        {view === 'PRACTICAL_SUBJECT_DETAIL' && activeSubject && (
                            <div className="pt-2 md:pt-6 px-4 w-full">
                                <PracticalSubjectDetailView
                                    subjectId={activeSubject}
                                    subjects={subjects}
                                    currentUser={currentUser}
                                    onBack={() => {
                                        window.history.back();
                                    }}
                                    navigate={navigate}
                                    onBookClick={handleBookClick}
                                    onManageBook={handleManageBook}
                                    onMoveBook={handleMoveBook}
                                    onDuplicateBook={handleDuplicateBook}
                                    onRenameSection={handleRenameSection}
                                    onRemoveSection={handleRemoveSection}
                                    onAddSection={handleAddSection}
                                    onReorderBooks={handleReorderBooks}
                                    onToggleFavorite={toggleFavorite}
                                    onSimulate={handleSimulate}
                                    setSectionEditConfig={setSectionEditConfig}
                                />
                            </div>
                        )}

                        {view === 'EXAM_PREP' && (
                            <div className="w-full">
                                <ExamPrepView 
                                    setView={(v: ViewState) => navigate(v)} 
                                    setQuizConfig={setQuizConfig} 
                                    subjects={subjects}
                                    currentUser={currentUser}
                                    onSelectSubject={(id: string) => {
                                        ActivityService.log(currentUser, 'view_subject', id, subjects[id]?.name || id);
                                        navigate('EXAM_SUBJECT_DETAIL', id);
                                    }}
                                    navigate={navigate}
                                />
                            </div>
                        )}

                        {view === 'QUIZ' && quizConfig && (
                            <div className="pt-6 md:pt-24 px-4 max-w-7xl mx-auto">
                                <QuizView
                                    subjectId={quizConfig.subjectId}
                                    count={quizConfig.count}
                                    onComplete={handleQuizComplete}
                                    onExit={() => window.history.back()}
                                    showToast={showToast}
                                />
                            </div>
                        )}


                        {/* Study Mode Overlay */}
                        {view === 'STUDY_MODE' && (
                            <StudyMode
                                userId={currentUser?.id}
                                onExit={() => navigate('HOME')}
                            />
                        )}
                        {/* Floating Feedback Button */}
                        <button
                            onClick={async () => {
                                const issue = prompt("Describe your issue or resource request:");
                                if (issue) {
                                    const success = await FeedbackService.submit(currentUser, issue);
                                    if (success) {
                                        showToast("Your feedback has been logged in the neural database.", "success");
                                    } else {
                                        showToast("Sync failure. Please try again later.", "error");
                                    }
                                }
                            }}
                            className="fixed bottom-6 right-6 z-[90] p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:scale-110 active:scale-95 transition-all group"
                            title="Report an issue or request a resource"
                        >
                            <Send size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </button>

                    </main>

                    <BookEditModal
                        isOpen={editModalConfig.isOpen}
                        mode={editModalConfig.mode}
                        book={editModalConfig.book}
                        currentSubjectId={editModalConfig.subjectId}
                        currentSectionId={editModalConfig.sectionId}
                        subjects={subjects}
                        onSave={handleSaveBook}
                        onDelete={handleDeleteBook}
                        onClose={() => setEditModalConfig(prev => ({ ...prev, isOpen: false }))}
                    />

                    <SectionEditModal
                        isOpen={sectionEditConfig.isOpen}
                        mode={sectionEditConfig.mode}
                        section={sectionEditConfig.section}
                        onSave={async (label, description) => {
                            if (sectionEditConfig.type === 'exam') {
                                if (sectionEditConfig.mode === 'add') {
                                    await handleExamAddSection(sectionEditConfig.subjectId, label, description);
                                } else {
                                    await handleExamRenameSection(sectionEditConfig.subjectId, sectionEditConfig.section!.id, label, description);
                                }
                            } else {
                                // Practical logic...
                                if (sectionEditConfig.mode === 'add') {
                                    await handleAddSection(sectionEditConfig.subjectId, label, description);
                                } else {
                                    await handleRenameSection(sectionEditConfig.subjectId, sectionEditConfig.section!.id, label, description);
                                }
                            }
                            setSectionEditConfig(prev => ({ ...prev, isOpen: false }));
                        }}
                        onClose={() => setSectionEditConfig(prev => ({ ...prev, isOpen: false }))}
                    />

                    <AnimatePresence>
                        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isSearchOpen && (
                            <GlobalSearch 
                                isOpen={isSearchOpen}
                                onClose={() => setIsSearchOpen(false)}
                                subjects={subjects}
                                onSelect={(type, id, subId) => {
                                    if (type === 'subject') {
                                        navigate('SUBJECT_DETAIL', id);
                                    } else if (type === 'book') {
                                        navigate('SUBJECT_DETAIL', subId);
                                        // Auto-scroll logic or just landing on subject is enough for now
                                    }
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {selectedUser && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 pointer-events-auto"
                            >
                                {/* Overlay with high-end blur */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                    onClick={() => setSelectedUser(null)}
                                />

                                {/* Modal Content - Centered Card */}
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] border border-white/10"
                                >
                                    {/* Header Section - More compact for visibility */}
                                    <div className="relative h-40 md:h-48 shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-orange-700">
                                            <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="absolute top-6 right-6 z-20 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-xl border border-white/10 transition-all hover:rotate-90 active:scale-90"
                                        >
                                            <X size={20} />
                                        </button>

                                        <div className="absolute -bottom-8 left-8 md:left-12 flex items-end gap-6 w-[calc(100%-2rem)]">
                                            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden ring-4 md:ring-6 ring-white dark:ring-zinc-950 shadow-2xl shrink-0">
                                                {selectedUser.avatarUrl ? (
                                                    <Image src={selectedUser.avatarUrl} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-400">{selectedUser.name[0]}</div>
                                                )}
                                            </div>
                                            <div className="pb-2 space-y-1 overflow-hidden">
                                                <h3 className="text-xl md:text-3xl font-black font-display text-slate-900 dark:text-white drop-shadow-sm truncate">
                                                    {selectedUser.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-white text-[9px] font-black rounded-lg uppercase tracking-widest ${SUPER_ADMIN_EMAILS.includes(selectedUser.email.toLowerCase()) ? 'bg-indigo-600' : 'bg-red-500'}`}>
                                                        {selectedUser.role === 'admin' ? (SUPER_ADMIN_EMAILS.includes(selectedUser.email.toLowerCase()) ? 'CMO' : 'Mod') : 'User'}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-400 font-mono tracking-tighter truncate">REG_ID: {selectedUser.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="mt-12 overflow-y-auto px-8 md:px-12 pb-12 space-y-10 custom-scrollbar scroll-smooth">
                                        {/* Summary Grid */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-4 md:p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-zinc-100 dark:border-white/5">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5 opacity-60">Study Phase</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Year {selectedUser.yearOfStudy || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 md:p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-zinc-100 dark:border-white/5">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5 opacity-60">Batch Identity</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedUser.batchYear || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Registry Data */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Registry Intel
                                                </h4>
                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-4 group/item">
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 shrink-0 group-hover/item:text-red-500 transition-colors">
                                                            <GraduationCap size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">Medical Institution</p>
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate text-sm">{selectedUser.college || 'Not Shared'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 group/item">
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 shrink-0 group-hover/item:text-blue-500 transition-colors">
                                                            <Send size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">Direct Pulse (Email)</p>
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate text-sm">{selectedUser.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 group/item">
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 shrink-0 group-hover/item:text-green-500 transition-colors">
                                                            <Phone size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">Neural Link (Contact)</p>
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate text-sm">{selectedUser.phone || 'Standby'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Platform Metrics
                                                </h4>
                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-4 group/item">
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 shrink-0 group-hover/item:text-amber-500 transition-colors">
                                                            <Clock size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">Last Uplink</p>
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate text-sm">
                                                                {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Dark Account'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 group/item">
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 shrink-0 group-hover/item:text-purple-500 transition-colors">
                                                            <Sparkles size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">Activation Date</p>
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200 truncate text-sm">
                                                                {new Date(selectedUser.joinedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Neural Feed Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Live Neural Feed
                                                </h4>
                                            </div>
                                            <div className="space-y-3">
                                                {selectedUserLogs.length > 0 ? (
                                                    selectedUserLogs.map((log) => (
                                                        <div key={log.id} className="flex gap-4 items-start p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 group/log hover:scale-[1.01] transition-all">
                                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.action === 'login' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                                                                log.action.includes('quiz') ? 'bg-amber-500' :
                                                                    'bg-red-500'
                                                                }`} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                                        {log.action.replace(/_/g, ' ')}
                                                                    </p>
                                                                    <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                                </div>
                                                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                                    Focused on <span className="text-slate-900 dark:text-zinc-300 font-bold">{log.targetName}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                                        <Activity size={24} className="text-zinc-300" />
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No Transmissions Logged</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Elevate/Privilege Section */}
                                        {currentUser && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) && selectedUser.email.toLowerCase() !== currentUser.email.toLowerCase() && (
                                            <div className="pt-6 border-t border-zinc-100 dark:border-white/5">
                                                <div className="p-6 md:p-8 bg-red-600/5 rounded-[2rem] md:rounded-[3rem] border border-red-600/10 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <ShieldAlert size={20} className="text-red-500" />
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Administrative Control</h4>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        {selectedUser.role === 'admin' ? (
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(`Revoke admin privileges for ${selectedUser.name}?`)) {
                                                                        setIsSyncing(true);
                                                                        try {
                                                                            const updated = { ...selectedUser, role: 'user' as const };
                                                                            await AuthService.updateUser(updated);
                                                                            setSelectedUser(updated);
                                                                        } finally {
                                                                            setIsSyncing(false);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all"
                                                            >
                                                                Revoke Admin Privileges
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(`Promote ${selectedUser.name} to System Administrator?`)) {
                                                                        setIsSyncing(true);
                                                                        try {
                                                                            const updated = { ...selectedUser, role: 'admin' as const };
                                                                            await AuthService.updateUser(updated);
                                                                            setSelectedUser(updated);
                                                                        } finally {
                                                                            setIsSyncing(false);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all"
                                                            >
                                                                Grant Mod Authority
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Bio-Navigation Console: Mobile Floating Bar */}
                    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] w-[92%] max-w-md animate-in slide-in-from-bottom-12 duration-700">
                        <div className="bg-black/85 dark:bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2.5 flex items-center justify-between gap-1"
                            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                        >
                            {[
                                { id: 'HOME', icon: Home, label: 'Home' },
                                { id: 'THEORY', icon: BookOpen, label: 'Books' },
                                { id: 'EXAM_PREP', icon: GraduationCap, label: 'Exams' },
                                { id: 'STUDY_MODE', icon: LayoutGrid, label: 'Study' },
                                { id: 'PROFILE', icon: User, label: 'Profile' }
                            ].map((item) => {
                                const isActive = view === item.id || 
                                               (item.id === 'THEORY' && view === 'SUBJECT_DETAIL') ||
                                               (item.id === 'EXAM_PREP' && (view === 'EXAM_SUBJECT_DETAIL' || view === 'QUIZ'));
                                const Icon = item.icon;
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.id as ViewState)}
                                        className={`relative flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 ${
                                            isActive 
                                            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110 z-10' 
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeNav"
                                                className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <InstallPrompt />
                    <AIChat currentView={view} subjects={subjects} />

                    <AnimatePresence>
                        {multiPartBook && (
                            <MultiPartModal 
                                book={multiPartBook} 
                                onClose={() => setMultiPartBook(null)}
                                onSelect={(part) => {
                                    ActivityService.log(currentUser, 'download_book', part.id, `${multiPartBook.title} - ${part.title}`);
                                    window.open(part.downloadUrl, '_blank');
                                    setMultiPartBook(null);
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Global Styles for Fonts/Scrollbars */}
                    <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
                                
                                :root {
                                    --font-sans: 'Inter', sans-serif;
                                    --font-display: 'Space Grotesk', sans-serif;
                                }
                                
                                body {
                                    font-family: var(--font-sans);
                                }
                                
                                .font-display {
                                    font-family: var(--font-display);
                                }
                                
                                /* Hide scrollbar for carousels */
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                                .scrollbar-hide {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>
                </div>

        </div>
    );
}
