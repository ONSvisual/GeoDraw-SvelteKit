<script>
	import { format } from "d3-format";
	import data from "./data.json";
	import Cards from "./Cards.svelte";
	import Card from "./Card.svelte";
	import BarChart from "./BarChart.svelte";
	import LineChart from "./LineChart.svelte";
	import ProfileChart from "./ProfileChart.svelte";
	import BigNumber from "./BigNumber.svelte";
</script>

<div class="page-content margin-bottom--2">
	<div class="wrapper">
		<Cards title="Simple responsive charts">
			<Card title="Population">
				<BigNumber value={data.population[0]['2021']} format={format(',')} unit="people" description="<mark>68.2 million</mark> in England and Wales"/>
			</Card>
			<Card title="Population density">
				<BigNumber value={14.8} format={format(',')} unit="people per square km" description="<mark>7.6</mark> in England and Wales"/>
			</Card>
			<Card title="Average (median) age">
				<BigNumber value={35} format={format(',')} unit="years" description="<mark>40</mark> in England and Wales"/>
			</Card>
			<Card title="Population trend">
				<LineChart data={data.population} zKey="areanm" xDomain={[1981,1991,2001,2011,2021]} xVal={2021}/>
			</Card>
			<Card title="Age profile">
				<ProfileChart data={data.age} xKey="category" yKey="2021_perc" zKey="areanm"/>
			</Card>
			<Card title="Sex">
				<BarChart data={data.sex} xKey="2021_perc" yKey="category" zKey="areanm"/>
			</Card>
		</Cards>
 	</div>
</div>

<style>
	@import url("https://cdn.ons.gov.uk/sixteens/77f1d9b/css/main.css");
</style>