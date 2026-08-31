# World Geo Quiz Pro

[Lovable 프롬프트]

수능 세계지리 O/X 퀴즈 웹 애플리케이션의 프론트엔드를 만들어줘.

1. 기술 스택 및 연동

React (Vite)와 Tailwind CSS를 사용해 줘.

백엔드 API 주소는 [Cloudflare Worker URL] https://world-geography-test.acumoxa.workers.dev/api/questions 이야. 컴포넌트가 마운트될 때 이 주소로 GET 요청을 보내서 문제 20개를 JSON 배열로 받아와 줘.

받아오는 데이터 구조는 { id, statement, is_correct, unit, explanation, source } 형태야. (is_correct는 1이면 O, 0이면 X)

2. 화면 구성 및 디자인

전체적인 디자인은 고등학생이 학습하기 편안한 깔끔하고 모던한 UI로 구성해 줘. 아이폰에서 가장 미려한 디자인이 좋겠어.

메인 화면: "세계지리 기출 O/X 모의고사"라는 제목과 함께 [20문제 풀기 시작] 버튼을 중앙에 배치해 줘.

퀴즈 화면:

상단에 현재 진행률을 나타내는 프로그레스 바(예: 3/20)를 표시해 줘.

중앙에 문제(statement)를 큰 글씨로 보여주고, 아래에 커다란 [O]와 [X] 버튼을 배치해 줘.

결과 화면: 20문제를 다 풀면 최종 점수(100점 만점 기준)를 보여주고, 내가 푼 20문제의 리스트와 나의 선택, 실제 정답, 그리고 해설(explanation), 출처(source)를 한눈에 복습할 수 있는 오답노트 리스트를 출력해 줘. [다시 풀기] 버튼도 하단에 넣어 줘.

3. 퀴즈 진행 로직

사용자가 O나 X를 선택하면, 즉시 해당 문제의 정답 여부(맞았습니다! / 틀렸습니다!)와 함께 해설(explanation)을 하단에 모달이나 카드 형태로 나타내 줘.

해설을 읽은 뒤 [다음 문제] 버튼을 눌러야만 다음 문제로 넘어가게 해 줘.

로딩 중일 때는 깔끔한 스피너 UI를 보여주고, 데이터를 불러오는 데 실패하면 에러 메시지와 함께 재시도 버튼을 보여줘.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://suji-ox.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ba5fea4-9265-4df4-bb5a-f04f04ae5e59).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
