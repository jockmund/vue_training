<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            v-on:keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="writeTicker"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="autocompleteTickerName in autocompleteTickers"
            :key="autocompleteTickerName"
            @click="addFromAutocomplete(autocompleteTickerName)"
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
          >
            {{ autocompleteTickerName }}
          </span>
        </div>
        <div v-if="inTicker" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <button
      v-on:click="add"
      type="button"
      class="
        my-4
        inline-flex
        items-center
        py-2
        px-4
        border border-transparent
        shadow-sm
        text-sm
        leading-4
        font-medium
        rounded-full
        text-white
        bg-gray-600
        hover:bg-gray-700
        transition-colors
        duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
    >
      <!-- Heroicon name: solid/mail -->
      <plus-sign-icon />
      Добавить
    </button>
  </section>
</template>

<script>
import PlusSignIcon from "./PlusSignIcon";

export default {
  name: "AddTicker",

  components: {
    PlusSignIcon
  },

  props: {
    inTickers: {
      type: Boolean,
      required: true
    },
    tokensName: {
      type: Object,
      required: true
    }
  },

  emits: {
    "add-ticker": (value) => typeof value === "string",
    "change-ticker-name": (value) => typeof value === "string"
  },

  data() {
    return {
      ticker: "",

      autocompleteTickers: [],
      tickers: [],

      writeTicker: false,
      inTicker: false,
      clickAutocomplete: false
    };
  },

  async created() {},

  watch: {
    ticker: function (selectedTokenName) {
      this.autocompleteTickers = [];
      this.writeTicker = !!selectedTokenName;

      this.$emit("change-ticker-name", this.ticker);

      if (!this.clickAutocomplete) {
        this.inTicker = false;
      }

      this.clickAutocomplete = false;

      for (const tokenKey in this.tokensName) {
        if (this.autocompleteTickers.length === 4) {
          break;
        }

        if (
          this.tokensName[tokenKey].FullName.toLowerCase().includes(
            selectedTokenName.toLowerCase()
          ) ||
          this.tokensName[tokenKey].Symbol.toLowerCase().includes(
            selectedTokenName.toLowerCase()
          )
        ) {
          this.autocompleteTickers.push(this.tokensName[tokenKey].Symbol);
        }
      }
    }
  },

  computed: {},

  methods: {
    addFromAutocomplete(autocompleteTicker) {
      this.clickAutocomplete = true;
      this.ticker = autocompleteTicker;
      this.$nextTick().then(this.add);
    },

    add() {
      if (this.ticker === "") {
        return;
      }

      if (this.inTickers) {
        this.inTicker = true;
        return;
      }

      this.$emit("add-ticker", this.ticker);

      this.ticker = "";

      this.inTicker = false;
    }
  }
};
</script>

<style scoped></style>
