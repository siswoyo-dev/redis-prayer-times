<template>
  <div class="main-container">
    <div class="left-panel">
      <div class="logo">
        <img class="mosque-logo" src="@/assets/mosque-logo.png" alt="Mosque Logo" />
      </div>
      <div class="title">PRAYER TIMES</div>

      <div
        v-for="(prayer, index) in prayers"
        :key="index"
        :class="['prayer-row', { upcoming: prayer.name === upcomingPrayer }]"
      >
        <img :src="prayer.icon" class="icon" :alt="`${prayer.name} icon`" />
        <div class="prayer-text">
          <div class="name">{{ prayer.name }}</div>
          <div class="time">{{ prayer.time }}</div>
        </div>
      </div>
    </div>

    <div class="right-panel" :style="{ backgroundImage: `url(${mosqueData.image_url})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: 'cover' }">
      <div class="header-info">
        <div class="city">{{ mosqueData.mosque_name }}</div>
        <div class="address">{{ mosqueData.address }}</div>
        <div class="date-row">
          <div class="date">{{ currentDate }}</div>
          <div class="hijri">{{ hijriDate }}</div>
        </div>
      </div>

      <div class="mihrab-container">
        <div class="mihrab mihrab-left"></div>
        <div class="mihrab mihrab-center"></div>
        <div class="mihrab mihrab-right"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MosquePrayerTimes",
  data() {
    return {
      currentDate: "",
      hijriDate: "",
      prayers: [],
      upcomingPrayer: "",
      mosqueData: {
        mosque_name: "Loading...",
        address: "",
        latitude: null,
        longitude: null,
      },
    };
  },
  mounted() {
    const mosqueId = this.$route.params.mosque_id;
    fetch(`/.netlify/functions/mosque-get?mosque_id=${mosqueId}`)
      .then((res) => res.json())
      .then((data) => {
        this.mosqueData = data;
        this.fetchPrayerTimes(data.latitude, data.longitude);
        this.fetchHijriDate();
      });

    this.currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
  methods: {
    fetchPrayerTimes(lat, lon) {
      fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=20`)
        .then((res) => res.json())
        .then((prayerData) => {
          const t = prayerData.data.timings;
          const hijri = prayerData.data.date.hijri;
          this.hijriDate = `${hijri.weekday.en}, ${hijri.day} ${hijri.month.en} ${hijri.year} H`;
          this.prayers = [
            { name: "IMSAK", time: t.Imsak, icon: "https://img.icons8.com/ios/50/crescent-moon.png" },
            { name: "FAJR", time: t.Fajr, icon: "https://img.icons8.com/ios/50/sunrise.png" },
            { name: "DHUHR", time: t.Dhuhr, icon: "https://img.icons8.com/ios/50/sun--v1.png" },
            { name: "ASR", time: t.Asr, icon: "https://img.icons8.com/ios/50/sunrise--v2.png" },
            { name: "MAGHRIB", time: t.Maghrib, icon: "https://img.icons8.com/ios/50/sunset--v1.png" },
            { name: "ISHA", time: t.Isha, icon: "https://img.icons8.com/ios/50/bright-moon.png" },
          ];

          const nowTime = new Date();
          const formatTime = (timeStr) => {
            const [h, m] = timeStr.split(":");
            const date = new Date();
            date.setHours(parseInt(h), parseInt(m), 0, 0);
            return date;
          };

          let found = false;
          for (let i = 0; i < this.prayers.length; i++) {
            const prayerTime = formatTime(this.prayers[i].time);
            if (nowTime < prayerTime) {
              this.upcomingPrayer = this.prayers[i].name;
              found = true;
              break;
            }
          }
          if (!found && this.prayers.length > 0) {
            this.upcomingPrayer = this.prayers[1].name;
          }
        });
    },
    fetchHijriDate() {
      // Already handled inside fetchPrayerTimes
    }
  }
};
</script>

<style scoped>
/* CSS same as before or modularized */
.main-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
}

/* ---------- Left Panel ---------- */
.left-panel {
  width: 30%;
  min-width: 300px;
  background: linear-gradient(to bottom, #e6ffe6, #c3f5c3);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  margin-bottom: 20px;
}

.mosque-logo {
  width: 60px;
  height: auto;
  filter: drop-shadow(1px 1px 2px #0a5f2e);
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #0a5f2e;
  margin-bottom: 30px;
}

.prayer-row {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #a0d468, #7cc242);
  padding: 12px 16px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.upcoming {
  border: 3px solid #0a5f2e;
  box-shadow: 0 0 10px #0a5f2e;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.prayer-text {
  color: #fff;
}

.prayer-text .name {
  font-weight: bold;
  font-size: 16px;
  line-height: 1.1;
}

.prayer-text .time {
  font-size: 14px;
  line-height: 1.1;
}

/* ---------- Right Panel ---------- */
.right-panel {
  flex: 1;
  background: #f9f9f9;
  position: relative;
  /* padding kept small; header/mihrabs are absolutely positioned */
  padding: 0;
}

/* Top-right city/date */
.header-info {
  position: absolute;
  top: 30px;
  right: 40px;
  text-align: right;
  z-index: 2;
}

.date-row {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #555;
  margin-top: 4px;
}

.date, .hijri {
  white-space: nowrap;
}

.city {
  font-size: 24px;
  font-weight: bold;
  color: #0a5f2e;
}

.date {
  font-size: 16px;
  color: #555;
  margin-top: 4px;
}

/* Bottom-right domes */
.mihrab-container {
  position: absolute;
  bottom: 30px;
  right: 40px;
  display: flex;
  gap: 30px;
  align-items: flex-end;
  z-index: 1;
}

.mihrab {
  border-radius: 50% 50% 0 0;
  background: linear-gradient(to top, #008000, #c0ffc0);
  border: 5px solid #fff;
}

.mihrab-center {
  height: 100px;
  width: 44px;
}

.mihrab-left {
  height: 80px;
  width: 36px;
}

.mihrab-right {
  height: 68px;
  width: 30px;
}
</style>
