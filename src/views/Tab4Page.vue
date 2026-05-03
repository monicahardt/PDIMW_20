<template>
  <section class="screen profile-screen">
    <h1 id="goal-heading">Understanding your stress</h1>
    <div class="phone-notch" aria-hidden="true"></div>

    <div class="profile-estimate">
      <p>
        Predicting, reducing and understanding the stress you feel.
      </p>
    </div>

    <section class="profile-section" aria-labelledby="goal-heading">
      <h1 id="goal-heading">Your goal</h1>

      <button class="goal-option is-selected" type="button">
        <span>Reduce stress</span>
        <span class="check-mark" aria-hidden="true"></span>
      </button>

      <button class="goal-option" type="button">
        <span>Improve balance</span>
        <span class="empty-mark" aria-hidden="true"></span>
      </button>
    </section>

    <section class="profile-section" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Data sources</h2>

      <div class="profile-source-grid">
        <article class="profile-source-card">
          <strong>Mobile wearable</strong>
          <small><span></span> Auto-connected</small>
        </article>

        <article class="profile-source-card">
          <span class="profile-source-icon is-blue" aria-hidden="true">Zzz</span>
          <strong>Sleep monitor</strong>
          <small><span></span> Auto-connected</small>
        </article>

        <article class="profile-source-card">
          <span class="profile-source-icon is-red" aria-hidden="true">iCal</span>
          <strong>Calendar</strong>
          <small><span></span> Wearable</small>
        </article>
      </div>
    </section>
    <button class="start-tracking" type="button">Start tracking</button>
  </section>
</template>
