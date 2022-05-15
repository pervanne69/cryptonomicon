<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker @add-ticker="add" :tickers="tickers"/>
      <div>
        <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-1"/>
        <button
            class="my-4 mx-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="hasNextPage"
            @click="page = page + 1"
        >Вперед
        </button>
        <button
            class="my-4 mx-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="page > 1"
            @click="page = page - 1"
        >Назад
        </button>
        <div>Фильтрация <input v-model="filter"/></div>
      </div>
      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4"/>
      <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
            v-for="t of paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-300': !t.isExists,
              'bg-white': t.isExists
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ t.name.toUpperCase() }} - {{ t.rate }}
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ t.price !== "-" ? formatPrice(t.price) : "-" }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
              @click.stop="removeItem(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
            >
              <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
              ></path>
            </svg>
            Удалить
          </button>
        </div>
      </div>
      <add-graph
          @calc-max-graph-elements="calculateMaxGraphElements"
          @delete-graph="deleteGraph"
          :selectedTicker="selectedTicker"
          :graph="graph"
          :maxGraphElements="maxGraphElements">
      </add-graph>
    </div>
  </div>
</template>
<script>
// [S]OLID
// 1. [x]  Одинаковый код watch | Критичность 2
// 2. [x]  При удалении остается подписка на загрузку курсов / Критичность 5 - исправлено
// 3. [x]  Кол-во запросов | Критичность 4
// 4. [x]  Запросы напрямую внутри компонента (???) | Критичность 5
// 5. [x]  Удаление графа при отсутствии тикеров / Критичность 2 -  неисправлено
// 6. [x]  Обаботка ошибок API | Критичность 5 - исправлено
// 7. [x]  График ужасно выглядит если будет много цен / Критичность 2
// 8. [x]  При удалении тикера не изменяется localstorage | Критичность 4 - исправлено
// 9. [ ]  localstorage и анонимные вкладки | Критичность 3
// 10. [x]  Магические строки и числа (URL, 5000 миллисекунд задержки +, ключ localstorage +, кол-во на странице +) | Критичность 1 - почти исправлено
// 11. [x] Самое критичное - Наличие в состоянии зависимых данных / Критичность 5+
// 12. [x] Доработать реализацию функции с запросом на все криптовалюты / Критичность 5
import {subscribeToTicker, unSubscribeFromTicker} from "./api";
import AddTicker from "./components/AddTicker";
import AddGraph from './components/AddGraph'
export default {
  name: 'App',
  components: {
    AddTicker,
    AddGraph
  },
  data() {
    return {
      tickers: [],
      filter: "",
      selectedTicker: null,
      graph: [],
      page: 1,
      isExists: false,
      maxGraphElements: 26,
      graphElementWidth: 38,
      keyLocalStorage: 'cryptonomicon-list',
      counterTickersOnPage: 6,
      queryInterval: 2000,
    }
  },
  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = windowData.page
    }
    const tickersData = localStorage.getItem(this.keyLocalStorage)
    if (tickersData) {
      this.tickers = JSON.parse(tickersData)
      this.tickers.forEach(ticker => {
        if (ticker.isExists === false) {
          subscribeToTicker(ticker.name.toUpperCase(), (newPrice) => this.updateTicker(ticker.name.toUpperCase(), newPrice), "USDT")
          ticker.rate = "USDT"
        } else {
          subscribeToTicker(ticker.name.toUpperCase(), (newPrice) => this.updateTicker(ticker.name.toUpperCase(), newPrice), ticker.rate)
        }
      })
    }
  },
  computed: {
    startIndex() {
      return (this.page - 1) * this.counterTickersOnPage
    },
    normalizedTickers() {
      this.tickers.forEach(ticker => {
        ticker.isExists = ticker.price === "-" ? ticker.isExists = false : ticker.isExists = true
      })
      return this.tickers
    },
    endIndex() {
      return this.page * this.counterTickersOnPage
    },
    filteredTickers() {
      return this.tickers.filter(t => t.name.toLowerCase().includes(this.filter.toLowerCase()))
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    },
  },
  methods: {
    calculateMaxGraphElements(graphItem) {
      if (!graphItem) {
        return
      }
      this.maxGraphElements = graphItem.clientWidth / this.graphElementWidth
    },
    async updateTicker(tickerName, price) {
      this.tickers
          .filter(t => t.name === tickerName)
          .forEach(t => {
            if (t === this.selectedTicker) {
              this.graph.push(price)
              while (this.graph.length > this.maxGraphElements + 1) {
                this.graph.shift()
              }
            }
            t.price = price
            localStorage.setItem(this.keyLocalStorage, JSON.stringify(this.tickers))
          })
    },
    formatPrice(price) {
      return price > 1 ? price.toFixed(2) : price.toPrecision(2)
    },
    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: '-',
        isExists: false,
      }
      if (currentTicker.name && !this.tickers.find(t => t.name.toLowerCase() === currentTicker.name.toLowerCase())) {
        currentTicker.name = currentTicker.name.toUpperCase()
        this.tickers = [...this.tickers, currentTicker]
        this.filter = ""
        if (currentTicker.isExists === false) {
          subscribeToTicker(currentTicker.name.toUpperCase(), (newPrice) => this.updateTicker(currentTicker.name.toUpperCase(), newPrice), "USD")
          currentTicker.rate = "USD"
          setTimeout(() => {
            if (currentTicker.isExists === false) {
              unSubscribeFromTicker(currentTicker.name.toUpperCase(), "USD")
              subscribeToTicker(currentTicker.name.toUpperCase(), (newPrice) => this.updateTicker(currentTicker.name.toUpperCase(), newPrice), "USDT")
              currentTicker.rate = "USDT"
              setTimeout(() => {
                if (currentTicker.isExists === false) {
                  unSubscribeFromTicker(currentTicker.name.toUpperCase(), "USDT")
                  subscribeToTicker(currentTicker.name.toUpperCase(), (newPrice) => this.updateTicker(currentTicker.name.toUpperCase(), newPrice), "BTC")
                  currentTicker.rate = "BTC"
                }
              }, 500)
            }
          }, 500)
        }
      }
    },
    select(ticker) {
      this.selectedTicker = ticker
      this.$nextTick(() => {
        this.calculateMaxGraphElements()
      })
    },
    removeItem(tickerRemove) {
      if (this.selectedTicker === tickerRemove) {
        this.selectedTicker = null
      }
      this.tickers = this.tickers.filter(t => t !== tickerRemove)
      localStorage.setItem(this.keyLocalStorage, JSON.stringify(this.tickers))
      unSubscribeFromTicker(tickerRemove.name.toUpperCase(), tickerRemove.rate)
    },
    deleteGraph() {
      this.selectedTicker = null
    }
  },
  watch: {
    ticker() {
      this.isExists = !!this.tickers.find(t => t.name.toLowerCase() === this.ticker.toLowerCase());
    },
    selectedTicker() {
      this.graph = []
      this.$nextTick().then(this.calculateMaxGraphElements)
    },
    normalizedTickers() {
      this.tickers = this.normalizedTickers
      localStorage.setItem(this.keyLocalStorage, JSON.stringify(this.tickers))
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1
      }
    },
    filter() {
      this.page = 1
    },
    pageStateOptions(value) {
      window.history
          .pushState(
              null, document.title,
              `${window.location.pathname}?filter=${value.filter}&page=${value.page}`)
    }
  }
}
</script>
