#!/bin/zsh
# 从当前脚本位置定位网站，支持目录名包含空格。
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "${0:A:h}" || exit 1
npm run publish
result=$?
if [ "$result" -eq 0 ]; then
  open "https://github.com/yuanzhibx/yuanzhibx.github.io/actions"
else
  print "提交未完成，请查看上方提示。"
fi
read "?按回车关闭窗口。"
exit "$result"
