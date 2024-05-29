const round1 = [
    {
        "S/N": 1,
        "Preamble Text": "State why mitosis is unlikely to occur in the following cells",
        "Question": "A sperm cell",
        "Subject": "Biology",
        "Answer": "Once sperm cells are formed they do not divide again."
    },
    {
        "S/N": 2,
        "Preamble Text": "State why mitosis is unlikely to occur in the following cells",
        "Question": "A hair cell",
        "Subject": "Biology",
        "Answer": "They are dead"
    },
    {
        "S/N": 3,
        "Preamble Text": "State why mitosis is unlikely to occur in the following cells",
        "Question": "A red blood cell",
        "Subject": "Biology",
        "Answer": "They have no nuclei"
    },
    {
        "S/N": 4,
        "Preamble Text": null,
        "Question": "Hardy-Weinberg equilibrium shows that the gene frequency (the proportion of a particular type of gene in a population) will remain constant if certain conditions occur. Mention one of these conditions",
        "Subject": "Biology",
        "Answer": "The size of the population is practically infinite.\nIndividuals in the population mate at random.\nAll individuals in the population have the same fitness, regardless of their genes.\nThere is no gain or loss of genes due to immigration into or emigration out of the population.\nThere is no new mutation in the population."
    },
    {
        "S/N": 5,
        "Preamble Text": null,
        "Question": "Give one advantage of cage culture fish when compared to other methods of fish culture",
        "Subject": "Biology",
        "Answer": "It requires less investment.\nIts installation is easy.\nSince it covers only a fraction of the pond, the remaining part can be used in the normal way.\nIt provides opportunity for controlled culture of choice.\nInspection of fishes and their feeding is much easier.\nTreatment of disease is much simple than that of pond culture.\nIn emergencies it can be removed from one place to another.\nSince the cage is meshed, the fishes inside have less chances of being attacked by predators.\nHarvesting is very simple.\nThe number of fish required at a particular time can be harvested and in this way it helps to maintain the non-seasonal supply of the fish.\nIt is economical as compared to other methods of fish culture except fishculture in running water."
    },
    {
        "S/N": 6,
        "Preamble Text": "Find the gradient $d y / d x$ from the implicit equation.",
        "Question": "$x^{3}-x^{2} y+y^{3}=7 \\quad$",
        "Subject": "Mathematics",
        "Answer": "$d y / d x=\\left(3 x^{2}-2 x y\\right) /\\left(x^{2}-3 y^{2}\\right)$\n$\\left[3 x^{2}-2 x y-x^{2} d y / d x+3 y^{2} d y / d x=0,(d y / d x)\\left(x^{2}-3 y^{2}\\right)=3 x^{2}-2 x y\\right.$,\n$\\left.d y / d x=\\left(3 x^{2}-2 x y\\right) /\\left(x^{2}-3 y^{2}\\right)\\right]$"
    },
    {
        "S/N": 7,
        "Preamble Text": "Find the gradient $d y / d x$ from the implicit equation.",
        "Question": "$2 x^{3}+x^{2} y-2 y^{3}=15 \\quad$",
        "Subject": "Mathematics",
        "Answer": "$d y / d x=\\left(6 x^{2}+2 x y\\right) /\\left(6 y^{2}-x^{2}\\right)$ $\\left[6 x^{2}+2 x y+x^{2}(d y / d x)-6 y^{2}(d y / d x)=0,(d y / d x)\\left(6 y^{2}-x^{2}\\right)=\\left(6 x^{2}+2 x y\\right)\\right.$, $\\left.d y / d x=\\left(6 x^{2}+2 x y\\right) /\\left(6 y^{2}-x^{2}\\right)\\right]$"
    },
    {
        "S/N": 8,
        "Preamble Text": "Find the gradient $d y / d x$ from the implicit equation.",
        "Question": "$3 x^{3}-2 x^{2} y+y^{3}=20 \\quad$",
        "Subject": "Mathematics",
        "Answer": "$\\mathbf{d y} / \\mathbf{d x}=\\left(9 x^{2}-\\mathbf{4 x y}\\right) /\\left(2 x^{2}-3 y^{2}\\right)$ $\\left[9 x^{2}-4 x y-2 x^{2}(d y / d x)+3 y^{2}(d y / d x)=0,(d y / d x)\\left(2 x^{2}-3 y^{2}\\right)=9 x^{2}-4 x y\\right.$ $\\left.d y / d x=\\left(9 x^{2}-4 x y\\right) /\\left(2 x^{2}-3 y^{2}\\right)\\right]$}"
    },
    {
        "S/N": 9,
        "Preamble Text": "Given that $\\cos A=-1 / \\sqrt{ } 2$ and $A$ is obtuse, and $\\sin B=\\sqrt{ } 3 / 2$ and $B$ is acute, evaluate",
        "Question": "$\\sin (A-B)$",
        "Subject": "Mathematics",
        "Answer": "$(1+\\sqrt{ } 3) / 2 \\sqrt{ } 2$, or $(1+\\sqrt{ } 3) \\sqrt{2} / 4$, or $(\\sqrt{2}+\\sqrt{6}) / 4$ $[\\sin (A-B)=\\sin A \\cos B-\\cos A \\sin B=(1 / \\sqrt{ } 2)(1 / 2)-(-1 / \\sqrt{ } 2)(\\sqrt{ } 3 / 2)=$ $(1+\\sqrt{ } 3) / 2 \\sqrt{ } 2]$"
    },
    {
        "S/N": 10,
        "Preamble Text": "Given that $\\cos A=-1 / \\sqrt{ } 2$ and $A$ is obtuse, and $\\sin B=\\sqrt{ } 3 / 2$ and $B$ is acute, evaluate",
        "Question": "$\\cos (A+B)$",
        "Subject": "Mathematics",
        "Answer": "$-(1+\\sqrt{ } 3) / 2 \\sqrt{2}$, or $-(1+\\sqrt{ } 3) \\sqrt{2} / 4$, or $-(\\sqrt{2}+\\sqrt{6}) / 4$ $[\\cos (A+B)=\\cos A \\cos B-\\sin A \\sin B=(-1 / \\sqrt{ } 2)(1 / 2)-(1 / \\sqrt{ } 2)(\\sqrt{ } 3 / 2)=$ $(-1-\\sqrt{ } 3) / 2 \\sqrt{ } 2]$"
    },
    {
        "S/N": 11,
        "Preamble Text": "Given that $\\cos A=-1 / \\sqrt{ } 2$ and $A$ is obtuse, and $\\sin B=\\sqrt{ } 3 / 2$ and $B$ is acute, evaluate",
        "Question": "$\\sin (A+B)$",
        "Subject": "Mathematics",
        "Answer": "$(1-\\sqrt{ } 3) / 2 \\sqrt{ } 2$, or $(1-\\sqrt{ } 3) \\sqrt{2} / 4$, or $(\\sqrt{2}-\\sqrt{6}) / 4$ $[\\sin (A+B)=\\sin A \\cos B+\\cos A \\sin B=(1 / \\sqrt{ } 2)(1 / 2)+(-1 / \\sqrt{ } 2)(\\sqrt{ } 3) / 2=$ $(1-\\sqrt{ } 3) / 2 \\sqrt{ } 2]$"
    },
    {
        "S/N": 12,
        "Preamble Text": "A bag contains 8 white balls, 7 black balls and 5 red balls. Three balls are drawn at random one after the other from the bag without replacement. Find the probability",
        "Question": "two balls are red and one black,",
        "Subject": "Mathematics",
        "Answer": "7/114\n$[A=\\{R R B, R B R, B R R\\}, P(A)=(5 / 20)(4 / 19)(7 / 18)+(5 / 20)(7 / 19)(4 / 18)+(7 / 20)(5 / 19)$ $(4 / 18)=3(7) /(19)(18)=7 / 19(6)=7 / 114]$"
    },
    {
        "S/N": 13,
        "Preamble Text": "A bag contains 8 white balls, 7 black balls and 5 red balls. Three balls are drawn at random one after the other from the bag without replacement. Find the probability",
        "Question": "two balls are white and one red,",
        "Subject": "Mathematics",
        "Answer": "7/57\n$[C=\\{W W R, W R W, R W W\\}, P(C)=(8 / 20)(7 / 19)(5 / 18)+(8 / 20)(5 / 19)(7 / 18)+(5 / 20)$ $(8 / 19)(7 / 18)=3(2)(7) /(19)(18)=7 / 19(3)=7 / 57]$"
    },
    {
        "S/N": 14,
        "Preamble Text": "A bag contains 8 white balls, 7 black balls and 5 red balls. Three balls are drawn at random one after the other from the bag without replacement. Find the probability",
        "Question": "two balls are black and one white.",
        "Subject": "Mathematics",
        "Answer": "14/95\n$[D=\\{B B W, B W B, W B B\\}, P(D)=(7 / 20)(6 / 19)(8 / 18)+(7 / 20)(8 / 19)(6 / 18)+(8 / 20)$ $(7 / 19)(6 / 18)=3(7 / 5)(2 / 9)(6 / 19)=14 / 95]$"
    },
    {
        "S/N": 15,
        "Preamble Text": null,
        "Question": "The scalar potential in a region is given by $V=\\frac{1}{2} k x^{2}$ where $k$ is constant. Find the electric field in the region.",
        "Subject": "Physics",
        "Answer": "$-k x \\hat{i}$"
    },
    {
        "S/N": 16,
        "Preamble Text": null,
        "Question": "The scalar potential in another region is given by $V=A+B x$ where $A$ and $B$ are constants. Find the electric force on a charge $q$ in the region.",
        "Subject": "Physics",
        "Answer": "$-q B \\hat{i}$"
    },
    {
        "S/N": 17,
        "Preamble Text": null,
        "Question": "The scalar potential in yet another region is given by $V=V_{0} \\cos \\cos (k z)$ where $V_{0}$ and $k$ are constants. Find the electric field in the region.",
        "Subject": "Physics",
        "Answer": "$k V_{0}\\sin (k z) \\hat{k}$"
    },
    {
        "S/N": 18,
        "Preamble Text": null,
        "Question": "What is the average translational kinetic energy of a molecule in an ideal gas at $17.0^{\\circ} \\mathrm{C} ?$",
        "Subject": "Physics",
        "Answer": "$6.00 \\times 10^{-21} \\mathrm{~J}$"
    },
    {
        "S/N": 19,
        "Preamble Text": null,
        "Question": "What is the temperature at which the average translational kinetic energy of an ideal gas molecule is $6.50 \\times 10^{-21} \\mathrm{~J}$ ?",
        "Subject": "Physics",
        "Answer": "$314 K=41^{\\circ} \\mathrm{C}$"
    },
    {
        "S/N": 20,
        "Preamble Text": null,
        "Question": "Find the average translational kinetic energy of a molecule in an ideal gas at $37.0^{\\circ} \\mathrm{C}$.",
        "Subject": "Physics",
        "Answer": "$6.42 \\times 10^{-21} \\mathrm{~J}$"
    },
    {
        "S/N": 21,
        "Preamble Text": "The speed of sound on a certain afternoon is $345 \\mathrm{~ms}^{-1}$.",
        "Question": "Find the frequency of the third harmonic of an open organ pipe of length $0.392 \\mathrm{~m}$.",
        "Subject": "Physics",
        "Answer": "$1.32 \\mathrm{kHz}$"
    },
    {
        "S/N": 22,
        "Preamble Text": "The speed of sound on a certain afternoon is $345 \\mathrm{~ms}^{-1}$.",
        "Question": "Find the frequency of the third overtone of an open organ pipe of length $0.392 \\mathrm{~m}$.",
        "Subject": "Physics",
        "Answer": "$1.76 \\mathrm{kHz}$"
    },
    {
        "S/N": 23,
        "Preamble Text": "The speed of sound on a certain afternoon is $345 \\mathrm{~ms}^{-1}$.",
        "Question": "Find the frequency of the third harmonic of a stopped organ pipe of length $0.392 \\mathrm{~m}$.",
        "Subject": "Physics",
        "Answer": "$660 \\mathrm{~Hz}$"
    },
    {
        "S/N": 24,
        "Preamble Text": null,
        "Question": "State the Aufbau Principle (or Building-up Principle).",
        "Subject": "Chemistry",
        "Answer": "Electrons always occupy the lowest empty energy level."
    },
    {
        "S/N": 25,
        "Preamble Text": null,
        "Question": "State Pauli's Exclusion Principle.",
        "Subject": "Chemistry",
        "Answer": "No two electrons in an atom can have exactly the same energy."
    },
    {
        "S/N": 26,
        "Preamble Text": null,
        "Question": "State Hund's Rule",
        "Subject": "Chemistry",
        "Answer": "When electrons fill a subshell, every orbital in the subshell is occupied by a single electron before any orbital is doubly occupied (and all electrons in singly occupied orbitals have their spins in the same direction)."
    },
    {
        "S/N": 27,
        "Preamble Text": null,
        "Question": "Extraction of metals go through three stages or processes. Give the three process.",
        "Subject": "Chemistry",
        "Answer": "Concentration of the ore/metal/metal compound.\nChemical reduction of the ore/metal compound.\nPurification of the metal."
    },
    {
        "S/N": 28,
        "Preamble Text": null,
        "Question": "Pick the pairs whose solutions will act as a buffer. $\\mathrm{H}_{3} \\mathrm{PO}_{4}, \\mathrm{NaHCO}_{3}, \\mathrm{HCl}, \\mathrm{NH}_{3}, \\mathrm{HPO}_{4}^{2-}, \\mathrm{H}_{2} \\mathrm{PO}_{4}^{-}, \\mathrm{NaOH}, \\mathrm{NH}_{4} \\mathrm{Cl}$,",
        "Subject": "Chemistry",
        "Answer": "$\\mathrm{NH}_{4} \\mathrm{Cl}, \\mathrm{NH}_{3}, \\mathrm{H}_{3} \\mathrm{PO}_{4}, \\mathrm{H}_{2} \\mathrm{PO}_{4}^{-}, \\mathrm{HPO}_{4}^{2-}, \\mathrm{H}_{2} \\mathrm{PO}_{4}^{-}$"
    },
    {
        "S/N": 29,
        "Preamble Text": null,
        "Question": "Explain why $\\mathrm{SO}_{2}$ gas is not the anhydride of $\\mathrm{H}_{2} \\mathrm{SO}_{4}$ acid.",
        "Subject": "Chemistry",
        "Answer": "An anhydride of a substance reacts with water without going through any redox reaction. The sulphur in $\\mathrm{SO}_{2}$ and $\\mathrm{H}_{2} \\mathrm{SO}_{4}$ are in different oxidation states so conversion of the gas to the acid will involve a redox reaction."
    },
    {
        "S/N": 30,
        "Preamble Text": null,
        "Question": "Calculate the concentration of an $\\mathrm{Na}_{2} \\mathrm{CO}_{3}$ solution if $20.0 \\mathrm{~cm}^{3}$ of it requires a titre of $24.0 \\mathrm{~cm}^{3}$ of $0.0950 \\mathrm{moldm}^{-3}$ of an $\\mathrm{HCl}$ solution in a titration using methyl orange as indicator.",
        "Subject": "Chemistry",
        "Answer": "$2 \\mathrm{HCl}+\\mathrm{Na}_{2} \\mathrm{CO}_{3} \\rightarrow 2 \\mathrm{NaCl}+\\mathrm{CO}_{2}+\\mathrm{H}_{2} \\mathrm{O}$\n$24.0,0.0950$\n$(24.0 * 0.0950) /(20.0 * \\mathrm{M})=2 / 1$\nConcentration of $\\mathrm{Na}_{2} \\mathrm{CO}_{3}$ solution, $\\mathrm{M} \\quad=(24.0 * 0.0950) /(20.0 * 2)=$\n$0.0570 \\mathrm{moldm}^{-3}$"
    },
    {
        "S/N": 31,
        "Preamble Text": null,
        "Question": "Iron (II) reacts with acidified solution of $\\mathrm{MnO}_{4}^{-}$in the ratio $5: 1$. Calculate the concentration of a solution of $\\mathrm{Fe}^{2+}$ ions if $20.0 \\mathrm{~cm}^{3}$ of it required $15.0 \\mathrm{~cm}^{3}$ of 0.120 moldm ${ }^{-3}$ of acidified solution of $\\mathrm{MnO}_{4}^{-}$for complete reaction.",
        "Subject": "Chemistry",
        "Answer": "$\\mathrm{MnO}_{4}^{-}+5 \\mathrm{Fe}^{2+}+8 \\mathrm{H}^{+} \\rightarrow$ products\n$15.0,0.120 \\quad 20.0, \\mathrm{M}$\n$(15.0 * 0.120) /(20.0 * \\mathrm{M})=1 / 5$\nConcentration of $\\mathrm{Fe}^{2+}, \\mathrm{M}=(5 * 15.0 * 0.120) / 20.0=0.450$\nmoldm $^{-3}$"
    },
    {
        "S/N": 32,
        "Preamble Text": null,
        "Question": "lodine reacts with the $\\mathrm{S}_{2} \\mathrm{O}_{3}{ }^{2-}$ ion in a $1: 2$ ratio. If $20.0 \\mathrm{~cm}^{3}$ of an iodine solution of unknown concentration reacted completely with $18.0 \\mathrm{~cm}^{3}$ of $0.0640 \\mathrm{moldm}^{-3}$ of $\\mathrm{S}_{2} \\mathrm{O}_{3}{ }^{2-}$ solution, then what is the concentration of the iodine solution?",
        "Subject": "Chemistry",
        "Answer": "$\\mathrm{I}_{2} \\quad+2 \\mathrm{~S}_{2} \\mathrm{O}_{3}^{2-} \\rightarrow$ product\n20.0, M\n$18.0,0.0640$\n$$\n(18.0 * 0.064) /(20.0 * M)=2 / 1\n$$\nConcentration of iodine, $\\mathrm{M}=(18.0 * 0.0640) /(2 * 20.0)=0.0288$\nmoldm $^{-3}$"
    }
]

export default round1