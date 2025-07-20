<script>
	let btnFunc = $state('Get Otp');
	let otpSent = $state(false);
	let onMainBtnClick;
</script>

<div class="h-dvh w-dvw flex flex-col md:flex-row bg-gradient-to-b from-[#334242] to-[#181918]">
	<div class="flex-1 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-10">
		<img class="shadow-[0_0_100px_#A7BA88] object-cover rounded-full size-10 md:size-50" src="./logo.svg" alt="logo">
		<p class="text-white text-2xl md:text-5xl font-semibold">Login Existing Account</p>
	</div>
	<div class="flex-6 -translate-y-10 md:translate-y-0 flex-col gap-6 md:flex-1 justify-center items-center flex">
		<p class="text-white md:mb-20 text-2xl md:text-5xl font-semibold">Mobile login</p>
		{#if !otpSent}
		<input type="number" placeholder="mobile number with country code"
					 class="w-[90%] h-12 bg-[#D9D9D950] rounded-full pl-4 text-white placeholder-gray-400">

		{:else}
		<input type="number" placeholder="enter otp sent on telegram"
					 class="w-[90%] h-12 bg-[#D9D9D950] rounded-full pl-4 text-white placeholder-gray-400">
		{/if}
		<button onclick={onMainBtnClick} class="w-[90%] h-12 bg-primary-400 rounded-full pl-4 text-white placeholder-gray-400">
			{btnFunc}
		</button>
	</div>
</div>