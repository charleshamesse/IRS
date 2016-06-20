library("irace")
irace.file <- "irace.Rdata"

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "iteration-results.txt"
if(length(args)>0){
  for(i in 1:length(args)){
    if(args[i] == "--irace.file")
      irace.file <- args[i+1]
    if(args[i] == "--filename")
      filename=args[i+1]
    if(args[i] == "--help"){
      cat("example:\n./script --irace.file irace.Rdata \n",
          "Values shown here are default.\n")
      q()
    }
  }
}

load(irace.file)


ids <- iraceResults$iterationElites
tests <- iraceResults$testing$experiments[,as.character(ids)]

#OUTPUT THE TEST
print(tests)
# OR PRINT IT
write.table(tests, file=filename, quote=FALSE)



