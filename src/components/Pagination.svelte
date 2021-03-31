<script lang="ts">
export let pages;
export let nextPageCallback;
export let previousPageCallback;

let currentPage = 0;

$: noPreviousPage = currentPage === 0;
$: noNextPage = currentPage === pages - 1;

function nextPage() {
    currentPage += 1;
    setTimeout(() => nextPageCallback(currentPage), 100);
}

function previousPage() {
    currentPage -= 1;
    setTimeout(() => previousPageCallback(currentPage), 100);
}

function lastPage() {
    currentPage = pages -1;
    nextPageCallback(currentPage);
}

function firstPage() {
    currentPage = 0;
    previousPageCallback(currentPage);
}

</script>
<div class="pagination-bar">
    <div>
        <button class="previous image80" disabled={noPreviousPage} on:click={firstPage}>
            {#if noPreviousPage == true}
            <img class="pagination" src="/images/start-disabled.png" alt="Start" />
            {:else}
            <img class="pagination" src="/images/start.png" alt="Start" />
            {/if}
            <span class="tooltip-text">Current</span>
        </button>
        <button class="previous image80" disabled={noPreviousPage} on:click={previousPage}>
            {#if noPreviousPage == true}
            <img class="pagination" src="/images/left-arrow-disabled.png"alt="Back" />
            {:else}
            <img class="pagination" src="/images/left-arrow.png" alt="Back" />
            {/if}
            <span class="tooltip-text">Previous</span>
        </button>
    </div>
    <div class="page-info">{pages - currentPage} of {pages}</div>
    <div>
        <button class="next image80" disabled={noNextPage} on:click={nextPage}>
            {#if noNextPage == true}
            <img class="pagination" src="/images/right-arrow-disabled.png" alt="Back" />
            {:else}
            <img class="pagination" src="/images/right-arrow.png" alt="Back" />
            {/if}
            <span class="tooltip-text">Next</span>
        </button>
        <button class="next image80" disabled={noNextPage} on:click={lastPage}>
            {#if noNextPage == true}
            <img class="pagination" src="/images/end-disabled.png" alt="Back" />
            {:else}
            <img class="pagination" src="/images/end.png" alt="Back" />
            {/if}
            <span class="tooltip-text">First</span>
        </button>
    </div>
</div>
<style>
div.pagination-bar {
    display: flex;
    justify-content: space-between;
    border-top: gray 2px double;
}
@media (max-width: 800px) {
    div.pagination-bar {
        padding-left: 8%;
        padding-right: 8%;
        height: 60px;
    }
    button:hover .tooltip-text {
        width: 4.5em;
        bottom: 35px;
    }
}
@media (min-width: 800px) {
    div.pagination-bar {
        padding-left: 20%;
        padding-right: 20%;
        height: 80px;
    }
    button:hover .tooltip-text {
        width: 5em;
        bottom: 5px;
    }
}
.previous {
    position: relative;
}
.next {
    position: relative;
}
div.page-info {
    align-self: center;
}
img {
  width: 100%;
}
</style>