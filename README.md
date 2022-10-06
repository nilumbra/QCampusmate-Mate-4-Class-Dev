# QCampusmate-Mate-4-Class-Dev
> **This repository will be archived by Oct 12, 2022. Direct all commits to [QCampusmate-Dev-Team/QCampusmate-Mate-4-Class-Dev](https://github.com/QCampusmate-Dev-Team/QCampusmate-Mate-4-Class-Dev)**

## 卒業単位自動計算システム

### ターゲットユーザー 
第一段階: 九州大学文学部１年〜４年生
第二段階: 学士課程・修士課程の生徒全体

### 課題
教務管理システムCampusmateに含まれる科目履修システムに、参加した授業の単位を表示する機能があるが、学生の専攻に応じて、それぞれの卒業要件に対し、どのカテゴリにあとどれくらい単位を履修すればそのカテゴリの要件を満たすかを計算する機能がない。一つ例を挙げれば、例えば、文学専攻教育科目には８０単位があり、その中で[文学部コア科目,  コース共通科目, 専門分野科目, 卒業論文, 自由選択科目]というように５大カテゴリがあって、それぞれ[9, 8, 26, 10, 27]単位の要件がある。さらに、文学部コア科目の中で[人文学科基礎科目,  人文学科共通科目, 古典語および外国語科目]のカテゴリがある等々。また、自由選択科目もあるため、履修した単位をどのカテゴリに振り分けた方が一番いいかという問題が出てくる。

### 実装した機能：
  UI上、Academic PlannerとDegree Requirement Checkerという二つのViewを開発した。
　
- Academic Plannerは学期毎に取得した単位とGPAの一覧を表示する機能が実装された。
- Degree Requirement Checkerは、木の構造でそれぞれのカテゴリに履修した科目をそのカテゴリの下に表示される上に、カテゴリで取得した単位の総計を表示する機能が実装された。


将来, Academic Plannerの名が示す通り、まだ履修していない大学の授業を追加・編集・削除し、それで立てた履修計画をPDFで出力できる機能を開会していきたいと思います。それをChrome Web Storeで公表し、学部のひとが使えるようにしたいと思います。そのための、最初段階は、今まで履修した授業の情報をCampusmateからダウンロードできるextensionをChrome Web Storeにて公表しています。
