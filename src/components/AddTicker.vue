<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"></label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
              v-model="ticker"
              @keydown.enter="add"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например BTC"
          />
        </div>
        <div style="display: flex;">
          <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
               v-for="sup of logCurrentSupposeTickers()">
                <span
                    class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                    @click="clickToSuppose(sup)"
                >
                  {{ sup }}
                </span>
          </div>
        </div>
        <div class="text-sm text-red-600" v-if="tickerExists">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" :disabled="tickerExists" />
  </section>
</template>

<script>
// Выводить проверку доступных тикеров через localstorage
import AddButton from './AddButton'
import {coinList} from "../api";

export default {
  components: {
    AddButton
  },
  data() {
    return {
      ticker: '',
      coinList,
      keyLocalStorage: 'cryptonomicon-list',
    }
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    tickerExists() {
      if (!this.ticker) {
        return false
      } else {
        return !!JSON.parse(localStorage.getItem(this.keyLocalStorage)).find(t => t.name.toLowerCase() === this.ticker.toLowerCase());

      }
    }
  },
  methods: {
    add() {
      const currentTicker = {
        name: this.ticker,
        price: '-',
        isExists: false,
      }
      this.$emit('add-ticker', this.ticker)
      if (currentTicker.name && !JSON.parse(localStorage.getItem(this.keyLocalStorage)).find(t => t.name.toLowerCase() === currentTicker.name.toLowerCase())) {
        this.ticker = ""
      }
    },
    logCurrentSupposeTickers() {
      let arr = this.coinList.filter(coin => coin.toLowerCase().includes(this.ticker.toLowerCase()))
      if (arr.length > 4) {
        arr = arr.slice(0, 4)
      }
      return arr
    },
    clickToSuppose(s) {
      this.ticker = s
      if (!JSON.parse(localStorage.getItem(this.keyLocalStorage)).find(t => t.name.toLowerCase() === this.ticker.toLowerCase())) {
        this.add()
      }
    },
  }
}
</script>