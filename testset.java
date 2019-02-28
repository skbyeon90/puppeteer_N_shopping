@Test(description = "각 컴포넌트의 속성 클릭 시, 속성 선택 액션 확인")
	public void TC_08_추천컴포넌트_속성선택() throws Exception {

		//판 갯수
		nFlickareaCount = appium.getElementCount(By.xpath("//div[@class='n_0ZWz0k5f']//span"));

		// 판 갯수만큼 반복
        int nSelectedCount = 0;
		for(int i=1; i<=nFlickareaCount; i++) {
			System.out.println(i);

			nAttrCount = appium.getElementCount(By.xpath("//div[@class='eg-flick-container']//ul[" + (i) + "]//li"));
			System.out.println(nAttrCount);

			// 속성 갯수만큼 반복
			for(int j=1; j<=nAttrCount; j++) {
				System.out.println(j);

				// 속성 갯수 나누기 6의 나머지가 0이 아닐 때 (판 넘어가지 않을 때)
				if((j % 6) != 0) {

					// 추천 속성 한 개씩 클릭 (1~6 -> 1~6, 7~12 -> 1~6, 13~18 -> 1~6 의 규칙)
					appium.click(By.xpath("//div[@class='eg-flick-container']//ul[" + (i) + "]//li[" + (j % 6) + "]//a[@custom-attribute='filterLi']"));

                    nSelectedCount++;

					// 속성명 우측에 노출되는 카운팅 숫자(텍스트로 불러옴)
					numAttrChoiceCount  = appium.findElement(By.xpath("//span[@class='_1qKeaVM7jk']")).getText();

					// 클릭한 속성 갯수와 카운팅 숫자 동일함
					assertEquals(numAttrChoiceCount, nSelectedCount);

					// 속성 초기화 버튼이 노출됨
					assertTrue(appium.isElementPresent(By.xpath("//button[@class='_2RulkB_Au8 N=a:rcc.reset']")));
				System.out.println("첫번째+j");
				}

				// 판 넘어갈 때
				else {

					// 추천 속성 한 개씩 클릭 (1~6 -> 1~6, 7~12 -> 1~6, 13~18 -> 1~6 의 규칙)
					appium.click(By.xpath("//div[@class='eg-flick-container']//ul[" + (i) + "]//li[" + ((j % 6) + 6) + "]//a[@custom-attribute='filterLi']"));

                    nSelectedCount++;

					// 속성명 우측에 노출되는 카운팅 숫자(텍스트로 불러옴)
					numAttrChoiceCount  = appium.findElement(By.xpath("//span[@class='_1qKeaVM7jk']")).getText();

				    // 클릭한 속성 갯수와 카운팅 숫자 동일함
				    assertEquals(numAttrChoiceCount, nSelectedCount);

				    // 속성 초기화 버튼이 노출됨
				    assertTrue(appium.isElementPresent(By.xpath("//button[@class='_2RulkB_Au8 N=a:rcc.reset']")));

				    // 판 넘기기
				    appium.swipeBy(By.xpath("//div[@class='flick_area']"));

					System.out.println("두번째+j");
				}
			}
		}
	}
