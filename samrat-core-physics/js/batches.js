// Batch Data for Samrat Core Physics
const batchData = {
    "Class 9": [
        { day: "Sunday", time: "7:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "5:00 PM", location: "Hatibagan", fee: "₹700/month" }
    ],
    "Class 10": [
        { day: "Sunday", time: "7:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "5:00 PM", location: "Hatibagan", fee: "₹700/month" },
        { day: "Thursday", time: "7:30 AM", location: "Kestopur", fee: "₹700/month" }
    ],
    "Class 11": [
        { day: "Sunday", time: "10:00 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Thursday", time: "8:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Wednesday", time: "7:30 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Sunday", time: "7:30 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "7:30 AM", location: "College Street", fee: "₹700/month" },
        { day: "Wednesday", time: "6:30 PM", location: "Kashi Bose Lane", fee: "₹700/month" },
        { day: "Tuesday", time: "5:15 PM", location: "Rajarhat", fee: "₹700/month" },
        { day: "Friday", time: "8:45 AM", location: "Rajarhat", fee: "₹700/month" }
    ],
    "Class 12": [
        { day: "Sunday", time: "11:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Thursday", time: "6:45 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Sunday", time: "5:00 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Tuesday", time: "7:30 AM", location: "College Street", fee: "₹700/month" },
        { day: "Friday", time: "7:00 PM", location: "Kashi Bose Lane", fee: "₹700/month" },
        { day: "Tuesday", time: "7:00 PM", location: "Rajarhat", fee: "₹700/month" },
        { day: "Friday", time: "7:30 AM", location: "Rajarhat", fee: "₹700/month" }
    ]
};

// Generate batch ID for Firestore
function getBatchId(cls, day, time, location) {
    return `${cls.replace(/\s+/g, '_')}_${day}_${time.replace(/[:\s]/g, '_')}_${location.replace(/\s+/g, '_')}`;
}

// Get all batches as flat array
function getAllBatches() {
    const batches = [];
    for (const [cls, slots] of Object.entries(batchData)) {
        slots.forEach(slot => {
            batches.push({
                class: cls,
                ...slot,
                id: getBatchId(cls, slot.day, slot.time, slot.location)
            });
        });
    }
    return batches;
}

// batchData, getBatchId, getAllBatches are global (available to all scripts loaded after this one)

