"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  Calendar as CalendarIcon,
  Bell,
  User,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  HelpCircle,
  XCircle,
  FileText,
  BarChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Mail, Phone, Settings, Edit, Camera } from "lucide-react";

type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
  attendees: Attendee[];
  location: string;
  image?: string;
};

type Attendee = {
  id: string;
  name: string;
  avatar: string;
  status: "going" | "maybe" | "not-going";
};

type User = {
  id: string;
  name: string;
  avatar: string;
};

type Reminder = {
  id: string;
  eventId: string;
  date: Date;
  message: string;
  isRead: boolean;
};

type ModalType =
  | "event-details"
  | "add-event"
  | "add-reminder"
  | "user-settings"
  | "attendees"
  | null;

const currentUser: User = {
  id: "1",
  name: "Alex Johnson",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Team Building Workshop",
    date: new Date(2025, 4, 10), // May 10, 2025
    description:
      "Join us for an exciting day of team building activities and discussions!",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        status: "going",
      },
      {
        id: "2",
        name: "Carlos Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        status: "going",
      },
      {
        id: "3",
        name: "Emma Davis",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        status: "maybe",
      },
      {
        id: "4",
        name: "Michael Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        status: "going",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    location: "Central Park Conference Center",
  },
  {
    id: "2",
    title: "Product Launch Party",
    date: new Date(2025, 4, 15), // May 15, 2025
    description:
      "Celebrating our newest product line with food, drinks, and networking.",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        status: "going",
      },
      {
        id: "2",
        name: "Carlos Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        status: "not-going",
      },
      {
        id: "5",
        name: "Sarah Wilson",
        avatar: "https://randomuser.me/api/portraits/women/67.jpg",
        status: "going",
      },
      {
        id: "6",
        name: "David Thompson",
        avatar: "https://randomuser.me/api/portraits/men/53.jpg",
        status: "going",
      },
    ],
    image:
      "https://plus.unsplash.com/premium_photo-1734215282808-8f2a261d98e0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    location: "Downtown Convention Center",
  },
  {
    id: "3",
    title: "Monthly Book Club",
    date: new Date(2025, 4, 22), // May 22, 2025
    description:
      'Discussing "The Silent Echo" by J.K. Morgan. Please read chapters 1-5 before attending.',
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        status: "maybe",
      },
      {
        id: "3",
        name: "Emma Davis",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        status: "going",
      },
      {
        id: "7",
        name: "Lisa Brown",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        status: "going",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    location: "Library Meeting Room",
  },
];

const mockReminders: Reminder[] = [
  {
    id: "1",
    eventId: "1",
    date: new Date(2025, 4, 9), // May 9, 2025
    message:
      "Team Building Workshop tomorrow! Don't forget to bring your notebook.",
    isRead: false,
  },
  {
    id: "2",
    eventId: "2",
    date: new Date(2025, 4, 13), // May 13, 2025
    message: "Product Launch Party in 2 days. RSVP closes tomorrow!",
    isRead: true,
  },
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function GroupEventPlanner() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [activeTab, setActiveTab] = useState<
    null | "events" | "reminders" | "profile" | "settings" | "suggest" | "rsvp"
  >(null);

  const [newEvent, setNewEvent] = useState<
    Partial<Event> & { imageFile?: File }
  >({
    title: "",
    date: new Date(),
    description: "",
    location: "",
  });

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    eventId: "",
    date: new Date(),
    message: "",
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setActiveModal(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      setNotification("Please fill in all required fields.");
      return;
    }

    const id = (events.length + 1).toString();

    const event: Event = {
      id,
      title: newEvent.title || "",
      date: new Date(newEvent.date),
      description: newEvent.description || "",
      attendees: [{ ...currentUser, status: "going" }],
      location: newEvent.location!,
      image: newEvent.image ?? undefined,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      date: new Date(),
      description: "",
      location: "",
      image: null,
      imageFile: null,
    });
    setPreviewImage(null);
    setActiveModal(null);

    setNotification(`Event "${event.title}" has been created!`);
  };

  const handleAddReminder = () => {
    if (!newReminder.eventId || !newReminder.date || !newReminder.message) {
      setNotification("Please fill in all required fields.");
      return;
    }

    const id = (reminders.length + 1).toString();
    const reminder: Reminder = {
      id,
      eventId: newReminder.eventId || "",
      date: new Date(newReminder.date),
      message: newReminder.message || "",
      isRead: false,
    };

    setReminders([...reminders, reminder]);
    setNewReminder({
      eventId: "",
      date: new Date(),
      message: "",
    });
    setActiveModal(null);
    setNotification("Reminder has been set!");
  };

  const handleRSVP = (
    eventId: string,
    status: "going" | "maybe" | "not-going"
  ) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          // Check if current user is already in attendees
          const attendeeIndex = event.attendees.findIndex(
            (a) => a.id === currentUser.id
          );
          if (attendeeIndex !== -1) {
            // Update existing attendee status
            const updatedAttendees = [...event.attendees];
            updatedAttendees[attendeeIndex] = {
              ...updatedAttendees[attendeeIndex],
              status,
            };
            return { ...event, attendees: updatedAttendees };
          } else {
            // Add new attendee
            return {
              ...event,
              attendees: [...event.attendees, { ...currentUser, status }],
            };
          }
        }
        return event;
      })
    );
    setNotification(`Your RSVP has been updated to "${status}".`);
  };

  const handleReadReminder = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, isRead: true } : reminder
      )
    );
  };

  const showEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setActiveModal("event-details");
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-10 md:h-16 border bg-gray-50"
        ></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      const hasEvents = events.some(
        (event) =>
          event.date.getDate() === day &&
          event.date.getMonth() === month &&
          event.date.getFullYear() === year
      );

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          className={`h-10 md:h-16 border relative flex flex-col items-center justify-start p-1 cursor-pointer transition-colors duration-200 ${
            isToday ? "bg-blue-50 border-blue-200" : ""
          } ${isSelected ? "bg-blue-100 border-blue-300" : ""} ${
            hasEvents ? "font-semibold" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span
            className={`text-sm ${isToday ? "text-blue-600 font-bold" : ""}`}
          >
            {day}
          </span>
          {hasEvents && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
          )}
        </motion.div>
      );
    }

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {monthName} {year}
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-100 rounded-full"
              onClick={handlePrevMonth}
            >
              ←
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-100 rounded-full"
              onClick={handleNextMonth}
            >
              →
            </motion.button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-600 text-sm py-2"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    const filteredEvents = selectedDate
      ? events.filter(
          (event) =>
            event.date.getDate() === selectedDate.getDate() &&
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
        )
      : events;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedDate
              ? `Events on ${formatDate(selectedDate)}`
              : "Upcoming Events"}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setActiveModal("add-event")}
          >
            <span className="mr-1">+</span> Add Event
          </motion.button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No events scheduled for this day.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 text-blue-600 font-medium"
              onClick={() => setActiveModal("add-event")}
            >
              Create an event
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 md:w-2/3">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold mb-2">
                        {event.title}
                      </h3>
                      <div className="flex -space-x-2">
                        {event.attendees.slice(0, 3).map((attendee) => (
                          <img
                            key={attendee.id}
                            src={attendee.avatar}
                            alt={attendee.name}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            title={attendee.name}
                          />
                        ))}
                        {event.attendees.length > 3 && (
                          <div
                            className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium border-2 border-white"
                            onClick={() => {
                              setSelectedEvent(event);
                              setActiveModal("attendees");
                            }}
                          >
                            +{event.attendees.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </div>
                      <div>{event.location}</div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-xs px-3 py-1 rounded-full ${
                            event.attendees.find((a) => a.id === currentUser.id)
                              ?.status === "going"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                          onClick={() => handleRSVP(event.id, "going")}
                        >
                          Going (
                          {
                            event.attendees.filter((a) => a.status === "going")
                              .length
                          }
                          )
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-xs px-3 py-1 rounded-full ${
                            event.attendees.find((a) => a.id === currentUser.id)
                              ?.status === "maybe"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                          onClick={() => handleRSVP(event.id, "maybe")}
                        >
                          Maybe (
                          {
                            event.attendees.filter((a) => a.status === "maybe")
                              .length
                          }
                          )
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-xs px-3 py-1 rounded-full ${
                            event.attendees.find((a) => a.id === currentUser.id)
                              ?.status === "not-going"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                          onClick={() => handleRSVP(event.id, "not-going")}
                        >
                          Not Going (
                          {
                            event.attendees.filter(
                              (a) => a.status === "not-going"
                            ).length
                          }
                          )
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 font-medium text-sm"
                        onClick={() => showEventDetails(event)}
                      >
                        Details
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReminders = () => {
    const unreadReminders = reminders.filter((r) => !r.isRead);

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reminders</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setActiveModal("add-reminder")}
          >
            <span className="mr-1">+</span> Add Reminder
          </motion.button>
        </div>

        {unreadReminders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No active reminders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unreadReminders.map((reminder) => {
              const event = events.find((e) => e.id === reminder.eventId);
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-yellow-800">
                      {event ? event.title : "Unknown Event"} -{" "}
                      {formatDate(reminder.date)}
                    </p>
                    <p className="text-yellow-700 text-sm">
                      {reminder.message}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-yellow-700 hover:text-yellow-900"
                    onClick={() => handleReadReminder(reminder.id)}
                  >
                    Mark as Read
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAttendeeChart = () => {
    const chartData = events.map((event) => ({
      name:
        event.title.length > 15
          ? event.title.substring(0, 15) + "..."
          : event.title,
      going: event.attendees.filter((a) => a.status === "going").length,
      maybe: event.attendees.filter((a) => a.status === "maybe").length,
      notGoing: event.attendees.filter((a) => a.status === "not-going").length,
    }));

    return (
      <div className="mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Event Attendance</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="going"
                stroke="#4ade80"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="maybe" stroke="#facc15" />
              <Line type="monotone" dataKey="notGoing" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="h-56 relative">
            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2"
              onClick={() => setActiveModal(null)}
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2">
              {selectedEvent.title}
            </h2>
            <div className="text-gray-600 mb-4">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {formatDate(selectedEvent.date)} at{" "}
                {formatTime(selectedEvent.date)}
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {selectedEvent.location}
              </div>
            </div>
            <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                Attendees ({selectedEvent.attendees.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedEvent.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={attendee.avatar}
                      alt={attendee.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium">{attendee.name}</p>
                      <p
                        className={`text-xs ${
                          attendee.status === "going"
                            ? "text-green-600"
                            : attendee.status === "maybe"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {attendee.status.charAt(0).toUpperCase() +
                          attendee.status.slice(1).replace("-", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700"
                onClick={() => setActiveModal(null)}
              >
                Close
              </motion.button>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedEvent.attendees.find((a) => a.id === currentUser.id)
                      ?.status === "going"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                  onClick={() => {
                    handleRSVP(selectedEvent.id, "going");
                    setActiveModal(null);
                  }}
                >
                  Going
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedEvent.attendees.find((a) => a.id === currentUser.id)
                      ?.status === "maybe"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                  onClick={() => {
                    handleRSVP(selectedEvent.id, "maybe");
                    setActiveModal(null);
                  }}
                >
                  Maybe
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedEvent.attendees.find((a) => a.id === currentUser.id)
                      ?.status === "not-going"
                      ? "bg-red-500 text-white"
                      : "bg-red-100 text-red-700"
                  }`}
                  onClick={() => {
                    handleRSVP(selectedEvent.id, "not-going");
                    setActiveModal(null);
                  }}
                >
                  Can't Go
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderAddEventModal = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Event</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setActiveModal(null)}
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Title*
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Date*
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={
                  newEvent.date instanceof Date
                    ? newEvent.date.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: new Date(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Location
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Event location"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Description
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-32"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Event description"
              />
            </div>
            <div>
              <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <svg
                  className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 8v-4m0 0l4 4m-4-4l-4 4"
                  />
                </svg>
                <span className="text-gray-500 group-hover:text-blue-500">
                  Click or drag & drop to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setPreviewImage(url);
                    setNewEvent({ ...newEvent, imageFile: file, image: url });
                  }}
                />
              </label>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg border"
                />
              )}
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                onClick={handleAddEvent}
              >
                Create Event
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderAddReminderModal = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Reminder</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setActiveModal(null)}
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Event*
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={newReminder.eventId}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, eventId: e.target.value })
                }
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {formatDate(event.date)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Reminder Date*
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={
                  newReminder.date instanceof Date
                    ? newReminder.date.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setNewReminder({
                    ...newReminder,
                    date: new Date(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Message*
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                value={newReminder.message}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, message: e.target.value })
                }
                placeholder="Reminder message"
              />
            </div>
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg"
                onClick={handleAddReminder}
              >
                Set Reminder
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderAttendeesModal = () => {
    if (!selectedEvent) return null;

    const attendeesByStatus = {
      going: selectedEvent.attendees.filter((a) => a.status === "going"),
      maybe: selectedEvent.attendees.filter((a) => a.status === "maybe"),
      notGoing: selectedEvent.attendees.filter((a) => a.status === "not-going"),
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Attendees for {selectedEvent.title}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setActiveModal(null)}
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-green-600">
              Going ({attendeesByStatus.going.length})
            </h3>
            <div className="space-y-2">
              {attendeesByStatus.going.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center p-3 bg-green-50 rounded-lg"
                >
                  <img
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <p className="font-medium">{attendee.name}</p>
                </div>
              ))}
              {attendeesByStatus.going.length === 0 && (
                <p className="text-gray-500 italic">
                  No confirmed attendees yet.
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-yellow-600">
              Maybe ({attendeesByStatus.maybe.length})
            </h3>
            <div className="space-y-2">
              {attendeesByStatus.maybe.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center p-3 bg-yellow-50 rounded-lg"
                >
                  <img
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <p className="font-medium">{attendee.name}</p>
                </div>
              ))}
              {attendeesByStatus.maybe.length === 0 && (
                <p className="text-gray-500 italic">No maybe responses yet.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-red-600">
              Not Going ({attendeesByStatus.notGoing.length})
            </h3>
            <div className="space-y-2">
              {attendeesByStatus.notGoing.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center p-3 bg-red-50 rounded-lg"
                >
                  <img
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <p className="font-medium">{attendee.name}</p>
                </div>
              ))}
              {attendeesByStatus.notGoing.length === 0 && (
                <p className="text-gray-500 italic">
                  No declined responses yet.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderMobileNav = () => {
    return (
      <div className="md:hidden">
        <button
          className="text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-medium">{currentUser.name}</p>
                </div>
                <div className="space-y-2">
                  <div
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                    onClick={() => setActiveTab("events")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>My Events</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                    onClick={() => setActiveTab("reminders")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Reminders</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                    onClick={() => setActiveTab("profile")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Profile</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                    onClick={() => setActiveTab("settings")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Settings</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderNotification = () => {
    return (
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  interface User {
    id: string;
    name: string;
    avatar: string;
  }

  interface Attendee extends User {
    status: "going" | "maybe" | "not-going";
  }

  interface Event {
    id: string;
    title: string;
    date: Date;
    description: string;
    location: string;
    attendees: Attendee[];
  }

  interface Suggestion {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: Date;
  }

  const initialSuggestions = [
    {
      id: "s1",
      eventId: "event-1",
      userId: "user-2",
      userName: "Jane Smith",
      userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "Let's bring some board games to this event!",
      timestamp: new Date("2025-05-01"),
    },
    {
      id: "s2",
      eventId: "event-2",
      userId: "user-3",
      userName: "Mike Johnson",
      userAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
      content:
        "I suggest we move this to the evening so more people can attend.",
      timestamp: new Date("2025-05-02"),
    },
  ];

  const EventSuggestionComponent = ({
    events,
    currentUser,
  }: {
    events: Event[];
    currentUser: User;
  }) => {
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [newSuggestion, setNewSuggestion] = useState({
      eventId: "",
      content: "",
    });
    const [notification, setNotification] = useState("");

    const handleAddSuggestion = () => {
      if (!newSuggestion.eventId || !newSuggestion.content.trim()) {
        setNotification("Please select an event and enter a suggestion.");
        return;
      }

      const suggestion = {
        id: `s${suggestions.length + 1}`,
        eventId: newSuggestion.eventId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: newSuggestion.content,
        timestamp: new Date(),
      };

      setSuggestions([...suggestions, suggestion]);
      setNewSuggestion({ eventId: "", content: "" });
      setNotification("Your suggestion has been added!");

      setTimeout(() => {
        setNotification("");
      }, 3000);
    };

    return (
      <div className="bg-white rounded-lg shadow">
        {notification && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <p>{notification}</p>
          </div>
        )}

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Suggest for an Event</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Event
              </label>
              <select
                className="w-full border p-2 rounded"
                value={newSuggestion.eventId}
                onChange={(e) =>
                  setNewSuggestion({
                    ...newSuggestion,
                    eventId: e.target.value,
                  })
                }
              >
                <option value="">-- Select an event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Suggestion
              </label>
              <textarea
                className="w-full border p-2 rounded"
                rows={3}
                placeholder="Share your ideas about this event..."
                value={newSuggestion.content}
                onChange={(e) =>
                  setNewSuggestion({
                    ...newSuggestion,
                    content: e.target.value,
                  })
                }
              />
            </div>
            <button
              onClick={handleAddSuggestion}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit Suggestion
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Suggestions</h3>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const event = events.find((e) => e.id === suggestion.eventId);
                return (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex items-start">
                      <img
                        src={suggestion.userAvatar}
                        alt={suggestion.userName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="flex items-center mb-1">
                          <p className="font-medium">{suggestion.userName}</p>
                          <span className="mx-2 text-gray-400">•</span>
                          <p className="text-sm text-gray-500">
                            {suggestion.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-blue-600 mb-2">
                          Re: {event ? event.title : "Unknown event"}
                        </p>
                        <p className="text-gray-700">{suggestion.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No suggestions yet. Be the first to suggest!
            </p>
          )}
        </div>
      </div>
    );
  };

  const RSVPDashboardComponent = ({
    events,
    handleRSVP,
    currentUser,
  }: {
    events: Event[];
    handleRSVP: (
      eventId: string,
      status: "going" | "maybe" | "not-going"
    ) => void;
    currentUser: User;
  }) => {
    const rsvpStats = events.map((event) => {
      const going = event.attendees.filter((a) => a.status === "going").length;
      const maybe = event.attendees.filter((a) => a.status === "maybe").length;
      const notGoing = event.attendees.filter(
        (a) => a.status === "not-going"
      ).length;

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        going,
        maybe,
        notGoing,
        total: going + maybe + notGoing,
      };
    });

    // Data for pie chart
    const getPieData = (eventId) => {
      const event = rsvpStats.find((e) => e.id === eventId);
      if (!event) return [];

      return [
        { name: "Going", value: event.going, color: "#4ade80" },
        { name: "Maybe", value: event.maybe, color: "#facc15" },
        { name: "Not Going", value: event.notGoing, color: "#f87171" },
      ];
    };

    const [selectedEventId, setSelectedEventId] = useState(
      events.length > 0 ? events[0].id : ""
    );

    // Find user's current RSVP status for the selected event
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const userRSVP =
      selectedEvent?.attendees.find((a) => a.id === currentUser.id)?.status ||
      null;

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">RSVP Dashboard</h2>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <select
            className="w-full border p-2 rounded mb-6"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          {selectedEvent && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  {selectedEvent.title}
                </h3>
                <p className="text-gray-600 mb-1">
                  <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                  {selectedEvent.date.toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <MapPin className="inline-block w-4 h-4 mr-1" />
                  {selectedEvent.location}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Your RSVP</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRSVP(selectedEventId, "going")}
                    className={`flex items-center px-3 py-2 rounded ${
                      userRSVP === "going"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Going
                  </button>
                  <button
                    onClick={() => handleRSVP(selectedEventId, "maybe")}
                    className={`flex items-center px-3 py-2 rounded ${
                      userRSVP === "maybe"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        : "bg-gray-100 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRSVP(selectedEventId, "not-going")}
                    className={`flex items-center px-3 py-2 rounded ${
                      userRSVP === "not-going"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700"
                    }`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Not Going
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">RSVP Stats</h4>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.status === "going"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Going</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.status === "maybe"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Maybe</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {
                        selectedEvent.attendees.filter(
                          (a) => a.status === "not-going"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Not Going</p>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData(selectedEventId)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {getPieData(selectedEventId).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">All Events RSVP Summary</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={events.map((event) => ({
                  name:
                    event.title.length > 15
                      ? event.title.substring(0, 15) + "..."
                      : event.title,
                  going: event.attendees.filter((a) => a.status === "going")
                    .length,
                  maybe: event.attendees.filter((a) => a.status === "maybe")
                    .length,
                  notGoing: event.attendees.filter(
                    (a) => a.status === "not-going"
                  ).length,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="going"
                  stroke="#4ade80"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="maybe" stroke="#facc15" />
                <Line type="monotone" dataKey="notGoing" stroke="#f87171" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState("personal");

    const userData = {
      ...currentUser,
      name: "Alex Johnson",
      role: "Event Organizer",
      location: "San Francisco, CA",
      email: "alex.johnson@example.com",
      phone: "(555) 123-4567",
      bio: "Passionate event organizer with 5+ years of experience creating memorable team building experiences and corporate events. Love bringing people together!",
      joinDate: "March 2023",
      profileImg: currentUser.avatar || "/api/placeholder/200/200",
    };

    const stats = [
      { label: "Events Organized", value: 24 },
      { label: "Events Attended", value: 38 },
      { label: "Active Groups", value: 5 },
    ];

    const pastEvents = [
      {
        id: 1,
        title: "Annual Company Retreat",
        date: "April 22, 2025",
        attendees: 45,
        location: "Mountain View Resort",
      },
      {
        id: 2,
        title: "Marketing Team Workshop",
        date: "March 15, 2025",
        attendees: 18,
        location: "Downtown Office",
      },
      {
        id: 3,
        title: "Product Development Brainstorm",
        date: "February 28, 2025",
        attendees: 12,
        location: "Innovation Lab",
      },
    ];

    return (
      <div className="flex flex-col bg-gray-50 min-h-screen">
        <div className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-blue-600">Profile</h1>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300">
                <span>+ Add Event</span>
              </button>
              <div className="relative w-10 h-10 bg-blue-100 rounded-full overflow-hidden">
                <img
                  src={userData.profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 w-full">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img
                        src={userData.profileImg}
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userData.name}
                  </h2>
                  <p className="text-blue-600 font-medium">{userData.role}</p>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{userData.location}</span>
                  </div>
                  <button className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium">
                    <Edit size={16} className="mr-1" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center py-2">
                    <Mail size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center py-2">
                    <Phone size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800">{userData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center py-2">
                    <Clock size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-800">{userData.joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 border-t pt-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xl font-bold text-blue-600">
                        {stat.value}
                      </span>
                      <span className="text-xs text-gray-600 text-center">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings size={18} className="mr-2" />
                  Settings
                </h3>
                <div className="space-y-3">
                  <button className="flex items-center text-gray-700 hover:text-blue-600 w-full py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                    <span>Notification Preferences</span>
                  </button>
                  <button className="flex items-center text-gray-700 hover:text-blue-600 w-full py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                    <span>Privacy Settings</span>
                  </button>
                  <button className="flex items-center text-gray-700 hover:text-blue-600 w-full py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                    <span>Account Preferences</span>
                  </button>
                  <button className="flex items-center text-gray-700 hover:text-blue-600 w-full py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                    <span>Calendar Sync</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex border-b">
                  <button
                    className={`px-6 py-4 text-center flex-1 font-medium ${
                      activeTab === "personal"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("personal")}
                  >
                    Personal Info
                  </button>
                  <button
                    className={`px-6 py-4 text-center flex-1 font-medium ${
                      activeTab === "events"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("events")}
                  >
                    My Events
                  </button>
                  <button
                    className={`px-6 py-4 text-center flex-1 font-medium ${
                      activeTab === "groups"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("groups")}
                  >
                    My Groups
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "personal" && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">About Me</h3>
                        <p className="text-gray-700">{userData.bio}</p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Team Building",
                            "Corporate Retreats",
                            "Networking",
                            "Workshops",
                            "Outdoor Activities",
                          ].map((tag, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Availability
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">
                            Preferred Event Times
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="weekdays"
                                className="mr-2"
                                checked
                              />
                              <label htmlFor="weekdays">Weekdays</label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="evenings"
                                className="mr-2"
                                checked
                              />
                              <label htmlFor="evenings">Evenings</label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="weekends"
                                className="mr-2"
                              />
                              <label htmlFor="weekends">Weekends</label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="mornings"
                                className="mr-2"
                              />
                              <label htmlFor="mornings">Mornings</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "events" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Past Events</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View All Events
                        </button>
                      </div>

                      <div className="space-y-4">
                        {pastEvents.map((event) => (
                          <div
                            key={event.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-semibold">{event.title}</h4>
                              <span className="text-sm text-gray-500">
                                {event.date}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <MapPin size={14} className="mr-1" />
                              <span>{event.location}</span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <Users size={14} className="mr-1" />
                              <span>{event.attendees} Attendees</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                          Upcoming Events
                        </h3>

                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50">
                          <Calendar size={40} className="text-gray-400 mb-2" />
                          <p className="text-gray-600 mb-2">
                            No upcoming events scheduled
                          </p>
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 text-sm">
                            <span>+ Create Event</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "groups" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">My Groups</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Create New Group
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            name: "Marketing Team",
                            members: 12,
                            events: 8,
                            photo: "/api/placeholder/100/100",
                          },
                          {
                            name: "Product Development",
                            members: 18,
                            events: 15,
                            photo: "/api/placeholder/100/100",
                          },
                          {
                            name: "Book Club",
                            members: 8,
                            events: 24,
                            photo: "/api/placeholder/100/100",
                          },
                          {
                            name: "Outdoor Activities",
                            members: 26,
                            events: 12,
                            photo: "/api/placeholder/100/100",
                          },
                          {
                            name: "Tech Conferences",
                            members: 42,
                            events: 5,
                            photo: "/api/placeholder/100/100",
                          },
                        ].map((group, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100">
                              <img
                                src={group.photo}
                                alt={group.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{group.name}</h4>
                              <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Users size={14} className="mr-1" />
                                  {group.members}
                                </span>
                                <span className="flex items-center">
                                  <Calendar size={14} className="mr-1" />
                                  {group.events} events
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Event Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Event Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Team Building",
                        "Workshops",
                        "Social Gatherings",
                        "Virtual Events",
                        "Conferences",
                        "Outdoor Activities",
                      ].map((type, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                        >
                          <input
                            type="checkbox"
                            id={`type-${i}`}
                            className="mr-2"
                            checked={i < 3}
                          />
                          <label htmlFor={`type-${i}`} className="text-sm">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Preferences
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify-new"
                          className="mr-2"
                          checked
                        />
                        <label htmlFor="notify-new">
                          New event invitations
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify-changes"
                          className="mr-2"
                          checked
                        />
                        <label htmlFor="notify-changes">Event changes</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify-reminders"
                          className="mr-2"
                          checked
                        />
                        <label htmlFor="notify-reminders">
                          Event reminders
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notify-suggestions"
                          className="mr-2"
                        />
                        <label htmlFor="notify-suggestions">
                          Event suggestions
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNotification()}

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => {
                setActiveTab(null);
              }}
            >
              Group Event Planner
            </h1>
            <div className="hidden md:flex items-center space-x-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{currentUser.name}</span>
            </div>
            {renderMobileNav()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="md:flex md:space-x-6">
          <div className="hidden md:block md:w-1/4 bg-white rounded-lg shadow p-4 h-fit">
            <div className="">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                </div>
              </div>
              <div className="space-y-3">
                <div
                  onClick={() => setActiveTab("events")}
                  className={
                    activeTab === "events"
                      ? "flex items-center space-x-2 text-gray-600 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      : "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                  }
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>My Events</span>
                </div>

                <div
                  onClick={() => setActiveTab("reminders")}
                  className={
                    activeTab === "reminders"
                      ? "flex items-center space-x-2 text-gray-600 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      : "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                  }
                >
                  <Bell className="w-5 h-5" />
                  <span>Reminders</span>
                </div>

                <div
                  onClick={() => setActiveTab("profile")}
                  className={
                    activeTab === "profile"
                      ? "flex items-center space-x-2 text-gray-600 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      : "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                  }
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </div>
                <div
                  onClick={() => setActiveTab("suggest")}
                  className={
                    activeTab === "suggest"
                      ? "flex items-center space-x-2 text-gray-600 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      : "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                  }
                >
                  <FileText className="w-5 h-5" />
                  <span>Suggest Event</span>
                </div>

                <div
                  onClick={() => setActiveTab("rsvp")}
                  className={
                    activeTab === "rsvp"
                      ? "flex items-center space-x-2 text-gray-600 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      : "flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-2 hover:bg-blue-50 rounded-lg"
                  }
                >
                  <BarChart className="w-5 h-5" />
                  <span>RSVP Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-3/4">
            {!activeTab && (
              <>
                {renderCalendar()}
                {renderEvents()}
                {renderReminders()}
                {renderAttendeeChart()}
              </>
            )}

            {activeTab === "events" && (
              <div>
                {renderEvents()}
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </div>
            )}

            {activeTab === "reminders" && (
              <div>
                {renderReminders()}
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <ProfilePage />
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <p>Theme: Light</p>
                <p>Notifications: Enabled</p>
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </div>
            )}

            {activeTab === "suggest" && (
              <>
                <EventSuggestionComponent
                  events={events}
                  currentUser={currentUser}
                />
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </>
            )}

            {activeTab === "rsvp" && (
              <>
                <RSVPDashboardComponent
                  events={events}
                  handleRSVP={handleRSVP}
                  currentUser={currentUser}
                />
                <button
                  onClick={() => setActiveTab(null)}
                  className="mt-4 flex items-center text-red-500 hover:text-red-600 transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="underline">Back</span>
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "event-details" && renderEventDetailsModal()}
        {activeModal === "add-event" && renderAddEventModal()}
        {activeModal === "add-reminder" && renderAddReminderModal()}
        {activeModal === "attendees" && renderAttendeesModal()}
      </AnimatePresence>

      <footer className="bg-white shadow-inner mt-8 ">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Group Event Planner App
          </p>
        </div>
      </footer>
    </div>
  );
}
