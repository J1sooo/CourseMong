package com.coursemong.back.balancegame;

import com.coursemong.back.balancegame.domain.BalanceGameResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class  BalanceGameService {

    private final BalanceGameResultRepository resultRepository;

    /** 점수 */
    private static final class Delta {
        final int P, R, C;
        // A, B 중 선택했을 때 P, R, C에 주는 가중치
        Delta(int p, int r, int c) { this.P=p; this.R=r; this.C=c; }
        // 타이브레이커 사용하기 위해서
        int v(char dim){ return switch (dim){ case 'P'->P; case 'R'->R; case 'C'->C; default->0; }; }
    }

    /** 채점 축 */
    private static final Map<Integer, Delta> A = new HashMap<>();
    private static final Map<Integer, Delta> B = new HashMap<>();
    static {
        // Q1~Q15
        A.put(1,  new Delta(+1, 0,  0));   B.put(1,  new Delta(-1, 0,  0));
        A.put(2,  new Delta(-1, 0, +1));   B.put(2,  new Delta(+1, 0, -1));
        A.put(3,  new Delta( 0,+1,  0));   B.put(3,  new Delta( 0,+2, +1));
        A.put(4,  new Delta(+1, 0,  0));   B.put(4,  new Delta( 0,+1,  0));
        A.put(5,  new Delta( 0,+2,  0));   B.put(5,  new Delta( 0,+1,  0));
        A.put(6,  new Delta( 0,+1,  0));   B.put(6,  new Delta( 0,-1,  0));
        A.put(7,  new Delta( 0,+1,  0));   B.put(7,  new Delta( 0,-1,  0));
        A.put(8,  new Delta(+2, 0,  0));   B.put(8,  new Delta(-1, 0,  0));
        A.put(9,  new Delta(-1, 0,  0));   B.put(9,  new Delta(+1, 0,  0));
        A.put(10, new Delta(+1, 0, -1));   B.put(10, new Delta(-1, 0, +1));
        A.put(11, new Delta( 0,+1,  0));   B.put(11, new Delta( 0,-1,  0));
        A.put(12, new Delta( 0, 0, -1));   B.put(12, new Delta( 0, 0, +1));
        A.put(13, new Delta( 0,-1,  0));   B.put(13, new Delta( 0,+1,  0));
        A.put(14, new Delta(-1, 0,  0));   B.put(14, new Delta(+1, 0,  0));
        A.put(15, new Delta( 0, 0, -1));   B.put(15, new Delta( 0, 0, +1));
    }

    /** 타이브레이커 => 동점 시 우선순위 문항으로 판정
     * C가 0이면 Q15만 보고, R이 0이면 Q3 → Q7 → Q11 순서, P가 0이면 Q8 → Q1 → Q14 순서로 본다. */
    private static final List<Integer> TIE_C = List.of(15);
    private static final List<Integer> TIE_R = List.of(3, 7, 11);
    private static final List<Integer> TIE_P = List.of(8, 1, 14);

    public BalanceGameEvaluateResponse evaluate(BalanceGameAnswerRequest req) {
        Map<Integer, String> raw = Optional.ofNullable(req.getAnswers()).orElse(Map.of());

        // 합산
        int p=0, r=0, c=0;
        for (int q=1; q<=15; q++){
            String pick = norm(raw.get(q)); // A, B만 허용
            Delta d = "A".equals(pick) ? A.get(q) : B.get(q);
            p += d.P; r += d.R; c += d.C;
        }

        // 부호 (score >= 0 → "+")
        String P = sign(p), R = sign(r), C = sign(c);

        // 타이브레이커 적용
        if (p==0) P = tie('P', raw).orElse(P);
        if (r==0) R = tie('R', raw).orElse(R);
        if (c==0) C = tie('C', raw).orElse(C);

        // 코드,유형 조회
        String code = "P"+P+" R"+R+" C"+C;
        BalanceGameResult meta = resultRepository.findByBalanceCode(code)
                .orElseThrow(() -> new IllegalStateException("유형 메타가 DB에 없습니다: " + code));

        BalanceGameEvaluateResponse.TypePayload payload = BalanceGameEvaluateResponse.TypePayload.builder()
                .id(mapCodeToId(code)) // 유형 1~8
                .code(code)
                .name(meta.getBalanceName())
                .summary(meta.getBalanceContent())
                .hashtags(splitTags(meta.getCharacter()))
                .best_match(parseIds(meta.getGoodMatch()))
                .worst_match(parseIds(meta.getNotGoodMatch()))
                .build();

        // 점수, 부호, 타입 반환
        BalanceGameEvaluateResponse res = new BalanceGameEvaluateResponse();
        res.setScores(Map.of("P", p, "R", r, "C", c));
        res.setPolarity(Map.of("P", P, "R", R, "C", C));
        res.setType(payload);
        return res;
    }

    private String norm(String s){
        if (s==null) return null;
        String up = s.trim().toUpperCase(Locale.ROOT);
        return ("A".equals(up) || "B".equals(up)) ? up : null;
    }
    // 0 이상이면 +, 아니면 - 반환
    private String sign(int v){ return v>=0? "+":"-"; }

    private Optional<String> tie(char dim, Map<Integer,String> answers){
        List<Integer> order = switch (dim){
            case 'C' -> TIE_C; case 'R' -> TIE_R; case 'P' -> TIE_P; default -> List.of();
        };
        for (int qid: order){
            String pick = norm(answers.get(qid));
            Delta d = "A".equals(pick) ? A.get(qid) : B.get(qid);
            int s = d.v(dim);
            if (s>0) return Optional.of("+");
            if (s<0) return Optional.of("-");
        }
        return Optional.empty();
    }

    // 해시태그
    private List<String> splitTags(String csv){
        String[] arr = csv.split("\\s*,\\s*");
        List<String> out = new ArrayList<>();
        for (String a: arr){
            String t = a.trim();
            if (!t.isEmpty()) out.add(t.startsWith("#")? t: "#"+t);
        }
        return out;
    }

    // 잘 맞는 유형, 안 맞는 유형
    private List<Integer> parseIds(String csv){
        String[] arr = csv.split("\\s*,\\s*");
        List<Integer> out = new ArrayList<>();
        for (String a: arr){
            try { out.add(Integer.parseInt(a.replace("#","").trim())); } catch (Exception ignored) {}
        }
        return out;
    }

    private int mapCodeToId(String code){
        return switch (code){
            case "P+ R+ C+" -> 1;
            case "P+ R+ C-" -> 2;
            case "P+ R- C+" -> 3;
            case "P+ R- C-" -> 4;
            case "P- R+ C+" -> 5;
            case "P- R+ C-" -> 6;
            case "P- R- C+" -> 7;
            case "P- R- C-" -> 8;
            default -> 0;
        };
    }
}