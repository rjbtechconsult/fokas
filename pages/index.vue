<template>
    <div :class="[theme, 'h-screen flex flex-col md:grid md:grid-cols-[300px_1fr]']">
        <!-- Mobile Sidebar Toggle -->
        <button 
            class="md:hidden p-3 text-lg w-full border-b"
            :class="theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-200 text-black border-gray-300'"
            @click="sidebarOpen = !sidebarOpen">
            {{ sidebarOpen ? "Hide Settings" : "Show Settings" }}
        </button>

        <!-- Left Sidebar (Settings) -->
        <aside 
            class="p-6 border-r flex flex-col gap-6 transition-all duration-300" :class="[
            theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-black border-gray-300',
            sidebarOpen ? 'block' : 'hidden md:flex'
        ]">

            <div  class="mb-6">
                <h1 class="text-3xl font-extrabold text-blue-500 mb-0 text-cente">Fokos</h1>
                <h6 :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">Stay focused with reminders and notifications</h6>
            </div>

            <!-- Settings Title -->
            <h2 class="text-xl font-bold text-blue-500">Settings</h2>

            <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2">
                    <input v-model="enableSound" type="checkbox" class="form-checkbox text-blue-500">
                    Play Sound
                </label>

                <label class="flex items-center gap-2">
                    <input v-model="enableNotification" type="checkbox" class="form-checkbox text-blue-500">
                    Show Notification
                </label>

                 <!-- Custom Reminder Interval -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">
                        Reminder Interval (minutes): {{ reminderInterval }}m
                    </label>
                    <input 
                        v-model="reminderInterval" 
                        type="number" 
                        min="5" 
                        step="5"
                        class="w-full p-2 rounded border focus:outline-none text-center"
                        :class="theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-black border-gray-400'"
                    >
                </div>

                <!-- Volume Slider -->
                <div v-if="enableSound" class="flex flex-col gap-2">
                    <label class="text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-600'">Volume:
                        {{ Math.round(soundVolume * 100) }}%</label>
                    <input v-model="soundVolume" type="range" min="0" max="1" step="0.01" class="w-full cursor-pointer">
                </div>

               
            </div>

            <!-- 🔽 Copyright & Version (Pinned to Bottom) -->
            <div class="mt-auto text-xs">
                <p :class="theme === 'dark' ? 'text-gray-500' : 'text-gray-600'">
                    © {{ new Date().getFullYear() }} Fokos. All rights reserved.
                </p>
                <p :class="theme === 'dark' ? 'text-gray-500' : 'text-gray-600'">Version 1.0.0</p>
            </div>

            

        </aside>

        <!-- Right Content Area -->
        <main 
            class="flex flex-col items-center justify-center p-6 flex-grow"
            :class="theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'">

            <!-- App Title -->
            <h1 class="text-2xl font-extrabold mb-6 text-blue-500 text-center">Let's Fokos on</h1>

            <!-- Focus Task Input -->
            <div class="relative w-full max-w-5xl">
                <textarea 
                    ref="textareaRef" 
                    v-model="focusTask" 
                    placeholder="What do you want to focus on?" 
                    rows="1"
                    class="w-full p-4 rounded-lg text-center text-4xl focus:outline-none resize-none overflow-hidden leading-normal"
                    :class="theme === 'dark' ? 'bg-transparent text-white border-gray-700' : 'bg-gray-100 text-black border-gray-400'"
                    autofocus
                    @input="adjustTextareaHeight" />

            </div>

            <!-- Buttons: Start / Stop -->
            <div class="mt-6 flex gap-4">
                <button 
                    v-if="!timerActive"
                    class="px-6 py-3 text-white text-lg rounded-lg shadow-lg transition duration-300"
                    :class="theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'"
                    @click="startFocusSession">
                    Start Fokosing
                </button>

                <button 
                    v-if="timerActive"
                    class="px-6 py-3 text-white text-lg rounded-lg shadow-lg transition duration-300"
                    :class="theme === 'dark' ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'"
                    @click="stopFocusSession">
                    Stop Fokosing
                </button>
            </div>
        </main>
    </div>
</template><script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

// ✅ Theme detection & switching
const theme = ref('dark');
const updateTheme = () => {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
};

// Detect system theme change
onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    theme.value = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
});

onUnmounted(() => {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateTheme);
});

// ✅ Sidebar Toggle for Mobile
const sidebarOpen = ref(false);

// ✅ User Preferences
const enableSound = ref(true);
const enableNotification = ref(true);
const soundVolume = ref(1);
const reminderInterval = ref(5); // Default interval in **minutes** (not seconds)

// Helper function to check if the device is a desktop
const isDesktop = () => {
    return !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// 🟢 Load saved preferences
onMounted(() => {
    adjustTextareaHeight();

    enableSound.value = JSON.parse(localStorage.getItem('enableSound')) ?? true;
    enableNotification.value = JSON.parse(localStorage.getItem('enableNotification')) ?? true;
    soundVolume.value = JSON.parse(localStorage.getItem('soundVolume')) ?? 1;
    reminderInterval.value = JSON.parse(localStorage.getItem('reminderInterval')) ?? 5; // Ensure it’s saved in minutes

    if (isDesktop() && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    window.addEventListener('beforeunload', () => clearInterval(interval));
});

// 🔄 Save preferences
watch([enableSound, enableNotification, soundVolume, reminderInterval], ([sound, notif, volume, interval]) => {
    localStorage.setItem('enableSound', JSON.stringify(sound));
    localStorage.setItem('enableNotification', JSON.stringify(notif));
    localStorage.setItem('soundVolume', JSON.stringify(volume));
    localStorage.setItem('reminderInterval', JSON.stringify(interval));
});

// 🟢 Focus Session Logic
const focusTask = ref('');
const countdown = ref(reminderInterval.value * 60); // Convert minutes to seconds
const timerActive = ref(false);
let interval;

const startFocusSession = () => {
    if (!focusTask.value.trim() || timerActive.value) return;

    timerActive.value = true;
    countdown.value = reminderInterval.value * 60; // Convert to seconds

    interval = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        }

        if (countdown.value === 0) {
            playReminder();
            showNotification();
            countdown.value = reminderInterval.value * 60; // Reset for next cycle
        }
    }, 1000);
};

const stopFocusSession = () => {
    clearInterval(interval);
    timerActive.value = false;
    countdown.value = reminderInterval.value * 60; // Reset countdown
};

// 🔊 Play Reminder Sound
const playReminder = () => {
    if (enableSound.value) {
        const audio = new Audio('/audio/knock.wav');
        audio.volume = soundVolume.value;
        audio.play();
    }
};

// 🔔 Show Browser Notification
const showNotification = () => {
    if (typeof Notification === 'undefined' || !isDesktop() || typeof window === 'undefined') {
        return;
    }
    if (enableNotification.value && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Let’s Fokos on', {
                    body: `${focusTask.value}`,
                    requireInteraction: true,
                    icon: '/favicon.ico'
                });
            });
        }
        // new Notification('Let’s Fokos on', {
        //     body: `${focusTask.value}`,
        //     requireInteraction: true,
        //     icon: '/favicon.ico'
        // });
    }else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(); // Try again after permission is granted
            }
        });
    }
};

// Adjust text area height dynamically
const textareaRef = ref(null);
const adjustTextareaHeight = () => {
    nextTick(() => {
        if (textareaRef.value) {
            textareaRef.value.style.height = 'auto'; // Reset height
            textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`; // Set new height
        }
    });
};

onUnmounted(() => {
    clearInterval(interval);
});
</script>

