<script>
    export let data;
    export let suffix = "%";
    export let zKey = "areanm";

</script>

{#if data}
<table class="visuallyhidden">
    <thead>
        <tr>
            <th>Category</th>
            {#each data[0].values as val}
            <td>{val[zKey]}</td>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each data as row}
        <tr>
            <td>{row.label}</td>
            {#each row.values as col}
            <td>{col.value}{suffix}</td>
            {/each}
        </tr>
        {/each}
    </tbody>
</table>
{/if}